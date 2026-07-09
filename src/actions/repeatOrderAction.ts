'use server';

import 'server-only';

import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import type { CartProduct } from '@/types/cart';
import { isProductPublished } from '@/utils/publishSchedule';
import { getCartItems } from './cart/getCartItems';
import { MAX_ITEM_QUANTITY } from '@/constants/cart';

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
			select: { id: true, items: { select: { productId: true, variantId: true, quantity: true } } },
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
				inStock: true,
				status: true,
				publishStartAt: true,
				publishEndAt: true,
			},
		});
		const productMap = new Map(products.map((p) => [p.id, p]));

		const variantIds = Array.from(
			new Set(order.items.map((i) => i.variantId).filter((v): v is string => !!v))
		);
		const variants = variantIds.length
			? await prisma.productVariant.findMany({
					where: { id: { in: variantIds } },
					select: { id: true, productId: true, stock: true },
				})
			: [];
		const variantById = new Map(variants.map((v) => [v.id, v]));

		const needsDefaultVariant = order.items.filter((i) => !i.variantId).map((i) => i.productId);
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
					{ id: ci.id, quantity: ci.quantity },
				])
			);

			let added = false;

			for (const item of order.items) {
				const product = productMap.get(item.productId);
				if (
					!product ||
					!product.inStock ||
					!isProductPublished(product.status, product.publishStartAt, product.publishEndAt)
				)
					continue;

				const effectiveVariantId =
					item.variantId ??
					defaultVariantByProduct.get(item.productId)?.id ??
					null;

				const availableStock = (() => {
					if (effectiveVariantId) {
						const v = variantById.get(effectiveVariantId);
						if (v && v.productId === item.productId) return v.stock;
						const dv = defaultVariantByProduct.get(item.productId);
						if (dv && dv.id === effectiveVariantId) return dv.stock;
						return 0;
					}
					return 0;
				})();

				if (!availableStock) continue;

				const desiredQty = Math.max(1, Math.min(MAX_ITEM_QUANTITY, item.quantity));
				const existing = existingByProduct.get(`${item.productId}:${effectiveVariantId ?? ''}`);

				if (existing) {
					const newQuantity = Math.min(
						availableStock,
						Math.min(MAX_ITEM_QUANTITY, existing.quantity + desiredQty)
					);
					if (newQuantity <= existing.quantity) continue;

					await tx.cartItem.update({
						where: { id: existing.id },
						data: { quantity: newQuantity },
					});
					existingByProduct.set(`${item.productId}:${effectiveVariantId ?? ''}`, {
						...existing,
						quantity: newQuantity,
					});
					added = true;
				} else {
					const quantityToInsert = Math.min(availableStock, desiredQty);
					if (quantityToInsert < 1) continue;

					const created = await tx.cartItem.create({
						data: {
							cartId: cart.id,
							productId: item.productId,
							variantId: effectiveVariantId,
							quantity: quantityToInsert,
						},
					});
					existingByProduct.set(`${item.productId}:${effectiveVariantId ?? ''}`, {
						id: created.id,
						quantity: quantityToInsert,
					});
					added = true;
				}
			}

			return { added };
		});

		if (!result.added) {
			return { success: false, code: 'failed' };
		}

		const fresh = await getCartItems(userId);
		return fresh.success ? { success: true, items: fresh.items as CartProduct[] } : { success: false, code: 'failed' };
	} catch (error) {
		return { success: false, code: 'failed' };
	}
}
