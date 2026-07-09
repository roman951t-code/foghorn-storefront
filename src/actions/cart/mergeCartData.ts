'use server';

import 'server-only';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { isProductPublished } from '@/utils/publishSchedule';
import { MAX_ITEM_QUANTITY } from '@/constants/cart';

export async function mergeCartData(
	localItems: { productId: string; variantId: string | null; quantity: number }[]
) {
	const cartT = await getTranslations('cart');

	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id;

	if (!userId) {
		return { success: false };
	}

	try {
		const normalizedItems = localItems
			.map((item) => ({
				productId: item.productId?.trim?.(),
				variantId: item.variantId ? String(item.variantId).trim() : null,
				quantity: Math.max(1, Math.min(MAX_ITEM_QUANTITY, Math.floor(item.quantity || 1))),
			}))
			.filter((item): item is { productId: string; variantId: string | null; quantity: number } => !!item.productId);

		if (!normalizedItems.length) {
			return { success: false, message: cartT('cartUpdateFailed') };
		}

		const productIds = Array.from(new Set(normalizedItems.map((item) => item.productId)));
		const products = await prisma.product.findMany({
			where: { id: { in: productIds } },
			select: { id: true, stock: true, inStock: true, status: true, publishStartAt: true, publishEndAt: true },
		});
		const productMap = new Map(products.map((p) => [p.id, p]));

		const variantIds = Array.from(
			new Set(normalizedItems.map((i) => i.variantId).filter((v): v is string => !!v))
		);
		const variants = variantIds.length
			? await prisma.productVariant.findMany({
					where: { id: { in: variantIds } },
					select: { id: true, productId: true, stock: true },
				})
			: [];
		const variantById = new Map(variants.map((v) => [v.id, v]));

		await prisma.$transaction(async (tx) => {
			const cart = await tx.cart.upsert({
				where: { userId },
				update: {},
				create: { userId },
				include: { items: true },
			});

			const existingByProduct = new Map(
				cart.items.map((ci) => [
					`${ci.productId}:${ci.variantId ?? ''}`,
					{ id: ci.id, quantity: ci.quantity },
				])
			);

			for (const item of normalizedItems) {
				const product = productMap.get(item.productId);
				if (
					!product ||
					!product.inStock ||
					!isProductPublished(product.status, product.publishStartAt, product.publishEndAt)
				)
					continue;

				const availableStock = item.variantId
					? (variantById.get(item.variantId)?.productId === item.productId
							? variantById.get(item.variantId)?.stock ?? 0
							: 0)
					: product.stock ?? 0;
				if (!availableStock) continue;

				const existing = existingByProduct.get(`${item.productId}:${item.variantId ?? ''}`);
				const currentQty = existing?.quantity ?? 0;
				const nextQty = Math.min(
					MAX_ITEM_QUANTITY,
					Math.min(availableStock, currentQty + item.quantity)
				);
				if (nextQty <= currentQty) continue;

				if (existing) {
					await tx.cartItem.update({
						where: { id: existing.id },
						data: { quantity: nextQty },
					});
					existingByProduct.set(`${item.productId}:${item.variantId ?? ''}`, {
						...existing,
						quantity: nextQty,
					});
				} else {
					const created = await tx.cartItem.create({
						data: { cartId: cart.id, productId: item.productId, variantId: item.variantId, quantity: nextQty },
					});
					existingByProduct.set(`${item.productId}:${item.variantId ?? ''}`, {
						id: created.id,
						quantity: nextQty,
					});
				}
			}
		});

		return { success: true };
	} catch (error) {
		return { success: false, message: cartT('cartUpdateFailed') };
	}
}
