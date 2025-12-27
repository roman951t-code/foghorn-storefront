'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { unstable_noStore as noStore } from 'next/cache';

const MAX_ITEM_QUANTITY = 99;

export async function mergeCartData(localItems: { id: string; quantity: number }[]) {
	noStore();

	const cartT = await getTranslations('cart');

	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id;

	if (!userId) {
		return { success: false };
	}

	try {
		const normalizedItems = localItems
			.map((item) => ({
				id: item.id?.trim?.(),
				quantity: Math.max(1, Math.min(MAX_ITEM_QUANTITY, Math.floor(item.quantity || 1))),
			}))
			.filter((item): item is { id: string; quantity: number } => !!item.id);

		if (!normalizedItems.length) {
			return { success: false, message: cartT('cartUpdateFailed') };
		}

		const productIds = Array.from(new Set(normalizedItems.map((item) => item.id)));
		const products = await prisma.product.findMany({
			where: { id: { in: productIds } },
			select: { id: true, stock: true, inStock: true },
		});
		const productMap = new Map(products.map((p) => [p.id, p]));

		await prisma.$transaction(async (tx) => {
			const cart = await tx.cart.upsert({
				where: { userId },
				update: {},
				create: { userId },
				include: { items: true },
			});

			const existingByProduct = new Map(
				cart.items.map((item) => [item.productId, { id: item.id, quantity: item.quantity }])
			);

			for (const item of normalizedItems) {
				const product = productMap.get(item.id);
				if (!product || !product.inStock || !product.stock) continue;

				const existing = existingByProduct.get(item.id);
				const currentQty = existing?.quantity ?? 0;
				const nextQty = Math.min(MAX_ITEM_QUANTITY, Math.min(product.stock, currentQty + item.quantity));
				if (nextQty <= currentQty) continue;

				if (existing) {
					await tx.cartItem.update({
						where: { id: existing.id },
						data: { quantity: nextQty },
					});
					existingByProduct.set(item.id, { ...existing, quantity: nextQty });
				} else {
					const created = await tx.cartItem.create({
						data: { cartId: cart.id, productId: item.id, quantity: nextQty },
					});
					existingByProduct.set(item.id, { id: created.id, quantity: nextQty });
				}
			}
		});

		return { success: true };
	} catch (error) {
		return { success: false, message: cartT('cartUpdateFailed') };
	}
}
