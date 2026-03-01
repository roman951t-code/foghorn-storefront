'use server';

import 'server-only';

import { headers } from 'next/headers';
import { Prisma } from '@prisma/client';
import { revalidateTag, updateTag } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PRODUCT_LIST_CACHE_TAG, productCacheTagById } from '@/constants/products';
import { isCustomerOrderCancellable, isCustomerOrderDeletable } from '@/utils/orderStatusPolicy';

type Result =
	| { success: true; action: 'cancelled' | 'deleted' }
	| { success: false; code: 'unauthorized' | 'not-found' | 'not-allowed' | 'failed' };

const INVENTORY_RESTOCKED_NOTE = 'Inventory restocked';
const isNotFoundError = (error: unknown) =>
	error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';

export async function deleteOrderAction(orderId: string): Promise<Result> {
	const requestHeaders = await headers();
	const session = await auth.api.getSession({ headers: requestHeaders });
	const userId = session?.user?.id;

	if (!userId) return { success: false, code: 'unauthorized' };

	try {
		const order = await prisma.order.findUnique({
			where: { id: orderId },
			select: {
				id: true,
				userId: true,
				status: true,
				items: { select: { productId: true, variantId: true, quantity: true } },
			},
		});

		if (!order || order.userId !== userId) return { success: false, code: 'not-found' };
		if (!isCustomerOrderCancellable(order.status) && !isCustomerOrderDeletable(order.status)) {
			return { success: false, code: 'not-allowed' };
		}

		const productIds = Array.from(new Set(order.items.map((item) => item.productId)));

		if (isCustomerOrderCancellable(order.status)) {
			await prisma.$transaction(async (tx) => {
				for (const item of order.items) {
					if (!item.variantId) continue;
					await tx.productVariant.updateMany({
						where: { id: item.variantId, productId: item.productId },
						data: { stock: { increment: item.quantity } },
					});
				}

				for (const productId of productIds) {
					const remaining = await tx.productVariant.findMany({
						where: { productId, stock: { gt: 0 } },
						select: { stock: true },
					});
					const totalStock = remaining.reduce((sum, v) => sum + (v.stock ?? 0), 0);
					await tx.product.update({
						where: { id: productId },
						data: { stock: totalStock, inStock: totalStock > 0 },
					});
				}

				await tx.order.update({
					where: { id: orderId },
					data: { status: 'CANCELLED' },
				});

				await tx.orderAuditEntry.create({
					data: {
						orderId,
						type: 'STATUS_CHANGE',
						fromStatus: 'PENDING',
						toStatus: 'CANCELLED',
						note: 'Cancelled by customer',
						adminEmail: null,
					},
				});

				await tx.orderAuditEntry.create({
					data: {
						orderId,
						type: 'NOTE',
						note: INVENTORY_RESTOCKED_NOTE,
						adminEmail: null,
					},
				});
			});

			const productTags = productIds.map((id) => productCacheTagById(id));
			await Promise.all(productTags.map((tag) => updateTag(tag)));
			await revalidateTag(PRODUCT_LIST_CACHE_TAG, 'default');
			return { success: true, action: 'cancelled' };
		}

		const shouldRevalidateAfterDelete =
			order.status === 'CANCELLED'
				? !(await prisma.orderAuditEntry.findFirst({
						where: { orderId, type: 'NOTE', note: INVENTORY_RESTOCKED_NOTE },
						select: { id: true },
					}))
				: false;

		await prisma.$transaction(async (tx) => {
			if (order.status === 'CANCELLED') {
				const restocked = await tx.orderAuditEntry.findFirst({
					where: { orderId, type: 'NOTE', note: INVENTORY_RESTOCKED_NOTE },
					select: { id: true },
				});

				if (!restocked) {
					for (const item of order.items) {
						if (!item.variantId) continue;
						await tx.productVariant.updateMany({
							where: { id: item.variantId, productId: item.productId },
							data: { stock: { increment: item.quantity } },
						});
					}

					for (const productId of productIds) {
						const remaining = await tx.productVariant.findMany({
							where: { productId, stock: { gt: 0 } },
							select: { stock: true },
						});
						const totalStock = remaining.reduce((sum, v) => sum + (v.stock ?? 0), 0);
						await tx.product.update({
							where: { id: productId },
							data: { stock: totalStock, inStock: totalStock > 0 },
						});
					}
				}
			}

			await tx.orderItem.deleteMany({ where: { orderId } });
			await tx.order.delete({ where: { id: orderId } });
		});

		if (shouldRevalidateAfterDelete) {
			const productTags = productIds.map((id) => productCacheTagById(id));
			await Promise.all(productTags.map((tag) => updateTag(tag)));
			await revalidateTag(PRODUCT_LIST_CACHE_TAG, 'default');
		}

		return { success: true, action: 'deleted' };
	} catch (error) {
		if (isNotFoundError(error)) {
			return { success: false, code: 'not-found' };
		}
		console.error('[deleteOrderAction] Failed to delete order', { orderId, userId, error });
		return { success: false, code: 'failed' };
	}
}
