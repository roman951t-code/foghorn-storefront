'use server';

import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import type { CartProduct } from '@/types/cart';

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

		const items = await prisma.$transaction(async (tx) => {
			const cart = await tx.cart.upsert({
				where: { userId },
				update: {},
				create: { userId },
				include: { items: true },
			});

			const existingByProduct = new Map(
				cart.items.map((item) => [item.productId, { id: item.id, quantity: item.quantity }])
			);

			for (const item of order.items) {
				const existing = existingByProduct.get(item.productId);

				if (existing) {
					const newQuantity = existing.quantity + item.quantity;
					await tx.cartItem.update({
						where: { id: existing.id },
						data: { quantity: newQuantity },
					});
					existingByProduct.set(item.productId, { ...existing, quantity: newQuantity });
				} else {
					await tx.cartItem.create({
						data: {
							cartId: cart.id,
							productId: item.productId,
							quantity: item.quantity,
						},
					});
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

			return cartItems.map(({ product, quantity }) => ({
				id: product.id,
				name: product.name,
				fullSlug: product.fullSlug,
				imageUrl: product.imageUrl,
				basePrice: product.basePrice?.toNumber?.() ?? 0,
				discountPrice: product.discountPrice?.toNumber?.() ?? null,
				quantity,
			}));
		});

		return { success: true, items };
	} catch (error) {
		return { success: false, code: 'failed' };
	}
}
