'use server';

import 'server-only';

import { Prisma } from '@prisma/client';
import { headers } from 'next/headers';
import { z } from 'zod';
import { revalidateTag, updateTag } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { normalizeOrder } from './orderUtils';
import type { UserOrder } from '@/types/order';
import { sendOrderConfirmationEmail } from '@/lib/orderEmails';
import { PRODUCT_LIST_CACHE_TAG, productCacheTagById } from '@/constants/products';

type CreateOrderItemPayload = { productId: string; quantity: number };

export type CreateOrderPayload = {
	items: CreateOrderItemPayload[];
	paymentMethod?: string;
	shipmentMethod?: string;
};

type CreateOrderResult =
	| { success: true; order: UserOrder }
	| { success: false; message?: string };

const CreateOrderSchema = z.object({
	items: z
		.array(
			z.object({
				productId: z.string().min(1, 'productId_required'),
				quantity: z.number().int().positive().max(99, 'quantity_too_high'),
			})
		)
		.min(1, 'items_required'),
	paymentMethod: z.string().optional(),
	shipmentMethod: z.string().optional(),
});

export async function createOrderAction(
	_: unknown,
	payload: CreateOrderPayload
): Promise<CreateOrderResult> {
	const parsed = CreateOrderSchema.safeParse(payload);
	if (!parsed.success) {
		return { success: false, message: 'invalid-payload' };
	}

	const requestHeaders = await headers();
	const session = await auth.api.getSession({ headers: requestHeaders });
	const userId = session?.user?.id;

	if (!userId) {
		return { success: false, message: 'unauthorized' };
	}

	const items = parsed.data.items.map((item) => ({
		productId: item.productId.trim(),
		quantity: Math.max(1, Math.floor(item.quantity)),
	}));

	const uniqueIds = Array.from(new Set(items.map((i) => i.productId)));
	const products = await prisma.product.findMany({
		where: { id: { in: uniqueIds } },
		select: {
			id: true,
			name: true,
			fullSlug: true,
			imageUrl: true,
			basePrice: true,
			discountPrice: true,
			stock: true,
			inStock: true,
		},
	});

	if (products.length !== uniqueIds.length) {
		return { success: false, message: 'invalid-items' };
	}

	const productMap = new Map(products.map((p) => [p.id, p]));
	const unavailable: string[] = [];

	const toCurrency = (value: number) => Math.round(value * 100) / 100;

	const orderItems = items
		.map((item) => {
			const product = productMap.get(item.productId);
			if (!product || !product.inStock) {
				unavailable.push(item.productId);
				return null;
			}

			const availableStock = product.stock ?? 0;
			if (item.quantity > availableStock) {
				unavailable.push(item.productId);
				return null;
			}

			const unitPrice = toCurrency(Number(product.discountPrice ?? product.basePrice ?? 0));
			const quantity = Math.max(1, item.quantity);
			const price = toCurrency(unitPrice * quantity);
			return {
				productId: item.productId,
				quantity,
				unitPrice,
				price,
			};
		})
		.filter(Boolean) as { productId: string; quantity: number; unitPrice: number; price: number }[];

	if (unavailable.length || !orderItems.length) {
		return { success: false, message: 'out-of-stock' };
	}

	const total = orderItems.reduce((acc, item) => acc + item.price, 0);
	const roundedTotal = Math.round(total * 100) / 100;

	try {
		const order = await prisma.$transaction(async (tx) => {
			for (const item of orderItems) {
				const updateResult = await tx.product.updateMany({
					where: { id: item.productId, stock: { gte: item.quantity } },
					data: {
						stock: { decrement: item.quantity },
						inStock: item.quantity < (productMap.get(item.productId)?.stock ?? 0),
					},
				});

				if (updateResult.count === 0) {
					throw new Error('stock-conflict');
				}
			}

			const newOrder = await tx.order.create({
				data: {
					userId,
					total: new Prisma.Decimal(roundedTotal.toFixed(2)),
					paymentMethod: parsed.data.paymentMethod ?? null,
					shipmentMethod: parsed.data.shipmentMethod ?? null,
					contactName: session.user?.name ?? null,
					contactLastName: session.user?.lastName ?? null,
					contactMiddleName: session.user?.middleName ?? null,
					contactEmail: session.user?.email ?? null,
					contactPhone: session.user?.phoneNumber ?? null,
					items: {
						create: orderItems.map((item) => ({
							productId: item.productId,
							quantity: item.quantity,
							unitPrice: new Prisma.Decimal(item.unitPrice.toFixed(2)),
							price: new Prisma.Decimal(item.price.toFixed(2)),
						})),
					},
				},
				include: {
					items: {
						include: {
							product: {
								select: {
									id: true,
									name: true,
									fullSlug: true,
									imageUrl: true,
								},
							},
						},
					},
				},
			});

			return newOrder;
		});

		const normalized = await normalizeOrder(order);

		const productTags = uniqueIds.map((id) => productCacheTagById(id));
		await Promise.all(productTags.map((tag) => updateTag(tag)));
		await revalidateTag(PRODUCT_LIST_CACHE_TAG, 'default');

		await sendOrderConfirmationEmail({
			order: normalized,
			email: session.user?.email ?? null,
			name: session.user?.name ?? null,
			headersList: requestHeaders,
		});

		return { success: true, order: normalized };
	} catch (error) {
		return { success: false, message: 'order-create-failed' };
	}
}
