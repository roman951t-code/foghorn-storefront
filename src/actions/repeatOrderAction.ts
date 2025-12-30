'use server';

import 'server-only';

import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import type { CartProduct } from '@/types/cart';

const MAX_ITEM_QUANTITY = 99;

type RepeatOrderResult =
	| { success: true; items: CartProduct[] }
	| { success: false; code: 'unauthorized' | 'not-found' | 'empty' | 'failed' };

export async function repeatOrderAction(orderId: string): Promise<RepeatOrderResult> {
	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id;

	if (!userId) {
		return { success: false, code: 'unauthorized' };
	}

	if (!orderId) {
		return { success: false, code: 'not-found' };
	}

	try {
		const order = await prisma.order.findFirst({
			where: { id: orderId, userId },
			select: { id: true, items: { select: { productId: true, quantity: true } } },
		});

		if (!order) {
			return { success: false, code: 'not-found' };
		}

		if (!order.items.length) {
			return { success: false, code: 'empty' };
		}

		const productIds = Array.from(new Set(order.items.map((item) => item.productId)));
		const products = await prisma.product.findMany({
			where: { id: { in: productIds } },
			select: {
				id: true,
				stock: true,
				inStock: true,
			},
		});
		const productMap = new Map(products.map((p) => [p.id, p]));

		const result = await prisma.$transaction(async (tx) => {
			const cart = await tx.cart.upsert({
				where: { userId },
				update: {},
				create: { userId },
				include: { items: true },
			});

			const existingByProduct = new Map(
				cart.items.map((item) => [item.productId, { id: item.id, quantity: item.quantity }])
			);

			let added = false;

			for (const item of order.items) {
				const product = productMap.get(item.productId);
				if (!product || !product.inStock || !product.stock) continue;

				const desiredQty = Math.max(1, Math.min(MAX_ITEM_QUANTITY, item.quantity));
				const existing = existingByProduct.get(item.productId);

				if (existing) {
					const newQuantity = Math.min(
						product.stock,
						Math.min(MAX_ITEM_QUANTITY, existing.quantity + desiredQty)
					);
					if (newQuantity <= existing.quantity) continue;

					await tx.cartItem.update({
						where: { id: existing.id },
						data: { quantity: newQuantity },
					});
					existingByProduct.set(item.productId, { ...existing, quantity: newQuantity });
					added = true;
				} else {
					const quantityToInsert = Math.min(product.stock, desiredQty);
					if (quantityToInsert < 1) continue;

					const created = await tx.cartItem.create({
						data: {
							cartId: cart.id,
							productId: item.productId,
							quantity: quantityToInsert,
						},
					});
					existingByProduct.set(item.productId, { id: created.id, quantity: quantityToInsert });
					added = true;
				}
			}

			const cartItems = await tx.cartItem.findMany({
				where: { cartId: cart.id },
				include: {
					product: {
						select: {
							id: true,
							name: true,
							fullSlug: true,
							imageUrl: true,
							basePrice: true,
							discountPrice: true,
						},
					},
				},
			});

			const items = cartItems.map(({ product, quantity }) => ({
				id: product.id,
				name: product.name,
				fullSlug: product.fullSlug,
				imageUrl: product.imageUrl,
				basePrice: product.basePrice?.toNumber?.() ?? 0,
				discountPrice: product.discountPrice?.toNumber?.() ?? null,
				quantity,
			}));

			return { items, added };
		});

		if (!result.added) {
			return { success: false, code: 'failed' };
		}

		return { success: true, items: result.items };
	} catch (error) {
		return { success: false, code: 'failed' };
	}
}
