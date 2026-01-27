'use server';

import 'server-only';

import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { isProductPublished } from '@/utils/publishSchedule';

const MAX_ITEM_QUANTITY = 99;

export async function addToCart(productIds: string | string[]) {
	const cartT = await getTranslations('cart');

	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id;

	if (!userId) {
		return { guest: true };
	}

	try {
		const ids = Array.isArray(productIds) ? productIds : [productIds];
		const normalizedIds = Array.from(
			new Set(
				ids
					.map((id) => id?.trim?.())
					.filter((id): id is string => !!id)
			)
		).slice(0, 50); // guard against abuse

		if (!normalizedIds.length) {
			return { success: false, message: cartT('cartUpdateFailed') };
		}

		const products = await prisma.product.findMany({
			where: { id: { in: normalizedIds } },
			select: { id: true, stock: true, inStock: true, status: true, publishStartAt: true, publishEndAt: true },
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

			let added = 0;

			for (const id of normalizedIds) {
				const product = productMap.get(id);
				if (
					!product ||
					!product.inStock ||
					!product.stock ||
					!isProductPublished(product.status, product.publishStartAt, product.publishEndAt)
				)
					continue;

				const existing = existingByProduct.get(id);
				const currentQty = existing?.quantity ?? 0;
				const nextQty = Math.min(MAX_ITEM_QUANTITY, Math.min(product.stock, currentQty + 1));
				if (nextQty <= currentQty) continue;

				if (existing) {
					await tx.cartItem.update({
						where: { id: existing.id },
						data: { quantity: nextQty },
					});
					existingByProduct.set(id, { ...existing, quantity: nextQty });
				} else {
					const created = await tx.cartItem.create({
						data: {
							cartId: cart.id,
							productId: id,
							quantity: nextQty,
						},
					});
					existingByProduct.set(id, { id: created.id, quantity: nextQty });
				}

				added += 1;
			}

			return added > 0;
		});

		return result ? { success: true } : { success: false, message: cartT('cartUpdateFailed') };
	} catch (error) {
		return { success: false, message: cartT('cartUpdateFailed') };
	}
}
