'use server';

import 'server-only';

import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { isProductPublished } from '@/utils/publishSchedule';
import { MAX_ITEM_QUANTITY } from '@/constants/cart';

type AddToCartItem = { productId: string; variantId: string | null };

export async function addToCart(item: AddToCartItem | AddToCartItem[]) {
	const cartT = await getTranslations('cart');

	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id;

	if (!userId) {
		return { guest: true };
	}

	try {
		const rawItems = Array.isArray(item) ? item : [item];
		const normalizedItems = rawItems
			.map((i) => ({
				productId: i?.productId?.trim?.(),
				variantId: i?.variantId ? String(i.variantId).trim() : null,
			}))
			.filter((i): i is AddToCartItem => !!i.productId)
			.slice(0, 50); // guard against abuse

		const byKey = new Map<string, AddToCartItem>();
		for (const it of normalizedItems) {
			byKey.set(`${it.productId}:${it.variantId ?? ''}`, it);
		}
		const uniqueItems = Array.from(byKey.values());

		if (!uniqueItems.length) {
			return { success: false, message: cartT('cartUpdateFailed') };
		}

		const productIds = Array.from(new Set(uniqueItems.map((i) => i.productId)));
		const requestedVariantIds = uniqueItems
			.map((i) => i.variantId)
			.filter((v): v is string => !!v);

		const products = await prisma.product.findMany({
			where: { id: { in: productIds } },
			select: { id: true, stock: true, inStock: true, status: true, publishStartAt: true, publishEndAt: true },
		});
		const productMap = new Map(products.map((p) => [p.id, p]));

		const requestedVariants = requestedVariantIds.length
			? await prisma.productVariant.findMany({
					where: { id: { in: requestedVariantIds } },
					select: { id: true, productId: true, stock: true },
				})
			: [];
		const variantById = new Map(requestedVariants.map((v) => [v.id, v]));

		const needsDefaultVariant = uniqueItems
			.filter((i) => i.variantId == null)
			.map((i) => i.productId);
		const defaultVariants = needsDefaultVariant.length
			? await prisma.productVariant.findMany({
					where: { productId: { in: needsDefaultVariant }, stock: { gt: 0 } },
					select: { id: true, productId: true, stock: true },
					orderBy: [{ productId: 'asc' }, { price: 'asc' }, { createdAt: 'asc' }],
				})
			: [];
		const defaultVariantByProduct = new Map<string, { id: string; stock: number }>();
		for (const v of defaultVariants) {
			if (!defaultVariantByProduct.has(v.productId)) {
				defaultVariantByProduct.set(v.productId, { id: v.id, stock: v.stock });
			}
		}

		const result = await prisma.$transaction(async (tx) => {
			const cart = await tx.cart.upsert({
				where: { userId },
				update: {},
				create: { userId },
				include: { items: true },
			});

			const existingByProduct = new Map(
				cart.items.map((ci) => [
					`${ci.productId}:${ci.variantId ?? ''}`,
					{ id: ci.id, quantity: ci.quantity, productId: ci.productId, variantId: ci.variantId ?? null },
				])
			);

			let added = 0;
			const updatedItems: { id: string; productId: string; variantId: string | null; quantity: number }[] = [];

			for (const it of uniqueItems) {
				const product = productMap.get(it.productId);
				if (
					!product ||
					!product.inStock ||
					!isProductPublished(product.status, product.publishStartAt, product.publishEndAt)
				)
					continue;

				const effectiveVariantId =
					it.variantId ??
					defaultVariantByProduct.get(it.productId)?.id ??
					null;

				const availableStock = (() => {
					if (effectiveVariantId) {
						const v = variantById.get(effectiveVariantId);
						if (v && v.productId === it.productId) return v.stock;
						const dv = defaultVariantByProduct.get(it.productId);
						if (dv && dv.id === effectiveVariantId) return dv.stock;
						return 0;
					}
					return product.stock ?? 0;
				})();

				if (!availableStock) continue;

				const existing = existingByProduct.get(`${it.productId}:${effectiveVariantId ?? ''}`);
				const currentQty = existing?.quantity ?? 0;
				const nextQty = Math.min(MAX_ITEM_QUANTITY, Math.min(availableStock, currentQty + 1));
				if (nextQty <= currentQty) continue;

				if (existing) {
					await tx.cartItem.update({
						where: { id: existing.id },
						data: { quantity: nextQty },
					});
					existingByProduct.set(`${it.productId}:${effectiveVariantId ?? ''}`, {
						...existing,
						quantity: nextQty,
					});
					updatedItems.push({
						id: existing.id,
						productId: it.productId,
						variantId: effectiveVariantId,
						quantity: nextQty,
					});
				} else {
					const created = await tx.cartItem.create({
						data: {
							cartId: cart.id,
							productId: it.productId,
							variantId: effectiveVariantId,
							quantity: nextQty,
						},
					});
					existingByProduct.set(`${it.productId}:${effectiveVariantId ?? ''}`, {
						id: created.id,
						productId: it.productId,
						variantId: effectiveVariantId,
						quantity: nextQty,
					});
					updatedItems.push({
						id: created.id,
						productId: it.productId,
						variantId: effectiveVariantId,
						quantity: nextQty,
					});
				}

				added += 1;
			}

			return { added, updatedItems };
		});

		return result.added > 0
			? { success: true, items: result.updatedItems }
			: { success: false, message: cartT('cartUpdateFailed') };
	} catch (error) {
		return { success: false, message: cartT('cartUpdateFailed') };
	}
}
