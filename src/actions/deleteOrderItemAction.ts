'use server';

import 'server-only';

import { Prisma } from '@prisma/client';
import { headers } from 'next/headers';
import { revalidateTag, updateTag } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { normalizeOrder } from './orderUtils';
import { PRODUCT_LIST_CACHE_TAG, productCacheTagById } from '@/constants/products';
import type { UserOrder } from '@/types/order';

type Result =
	| { success: true; order?: UserOrder }
	| { success: false; code: 'unauthorized' | 'not-found' | 'empty' | 'invalid-status' };

export async function deleteOrderItemAction(orderItemId: string): Promise<Result> {
	const requestHeaders = await headers();
	const session = await auth.api.getSession({ headers: requestHeaders });
	const userId = session?.user?.id;

	if (!userId) return { success: false, code: 'unauthorized' };

	const orderItem = await prisma.orderItem.findUnique({
		where: { id: orderItemId },
		include: {
			order: {
				include: {
					discounts: true,
					items: {
						include: {
							product: { select: { id: true, name: true, fullSlug: true, imageUrl: true } },
							variant: {
								select: {
									id: true,
									sku: true,
									attributes: {
										select: {
											attribute: { select: { name: true, unit: true } },
											value: true,
										},
										orderBy: { attribute: { name: 'asc' } },
									},
								},
							},
						},
					},
				},
			},
		},
	});

	if (!orderItem || orderItem.order.userId !== userId) {
		return { success: false, code: 'not-found' };
	}

	const orderId = orderItem.orderId;
	const deletedProductId = orderItem.productId;
	const deletedVariantId = orderItem.variantId;
	const deletedQuantity = orderItem.quantity;

	const result = await prisma.$transaction(async (tx) => {
		const order = await tx.order.findUnique({
			where: { id: orderId },
			include: {
				discounts: true,
				items: {
					include: {
						product: { select: { id: true, name: true, fullSlug: true, imageUrl: true } },
						variant: {
							select: {
								id: true,
								sku: true,
								attributes: {
									select: {
										attribute: { select: { name: true, unit: true } },
										value: true,
									},
									orderBy: { attribute: { name: 'asc' } },
								},
							},
						},
					},
				},
			},
		});

		if (!order || order.userId !== userId) {
			return { success: false as const, code: 'not-found' as const };
		}

		if (order.status !== 'PENDING') {
			return { success: false as const, code: 'invalid-status' as const };
		}

		const remainingItems = order.items.filter((item) => item.id !== orderItemId);

		if (deletedVariantId) {
			await tx.productVariant.updateMany({
				where: { id: deletedVariantId, productId: deletedProductId },
				data: { stock: { increment: deletedQuantity } },
			});

			const remaining = await tx.productVariant.findMany({
				where: { productId: deletedProductId, stock: { gt: 0 } },
				select: { stock: true },
			});
			const totalStock = remaining.reduce((sum, v) => sum + (v.stock ?? 0), 0);
			await tx.product.update({
				where: { id: deletedProductId },
				data: { stock: totalStock, inStock: totalStock > 0 },
			});
		}

		if (remainingItems.length === 0) {
			await tx.orderItem.delete({ where: { id: orderItemId } });
			await tx.order.delete({ where: { id: orderId } });
			return { success: true as const, order: undefined };
		}

		await tx.orderItem.delete({ where: { id: orderItemId } });

		const newTotal = remainingItems.reduce((acc, item) => acc + Number(item.price ?? 0), 0);

		const updated = await tx.order.update({
			where: { id: orderId },
			data: { total: new Prisma.Decimal(newTotal.toFixed(2)) },
			include: {
				discounts: true,
				items: {
					include: {
						product: { select: { id: true, name: true, fullSlug: true, imageUrl: true } },
						variant: {
							select: {
								id: true,
								sku: true,
								attributes: {
									select: {
										attribute: { select: { name: true, unit: true } },
										value: true,
									},
									orderBy: { attribute: { name: 'asc' } },
								},
							},
						},
					},
				},
			},
		});

		return { success: true as const, order: updated };
	});

	if (!result.success) return result;

	if (!result.order) {
		await updateTag(productCacheTagById(deletedProductId));
		await revalidateTag(PRODUCT_LIST_CACHE_TAG, 'default');
		return { success: true, order: undefined };
	}

	const normalized = await normalizeOrder(result.order);
	await updateTag(productCacheTagById(deletedProductId));
	await revalidateTag(PRODUCT_LIST_CACHE_TAG, 'default');
	return { success: true, order: normalized };
}
