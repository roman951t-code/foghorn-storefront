'use server';

import 'server-only';

import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { isProductPublished } from '@/utils/publishSchedule';

const MAX_ITEM_QUANTITY = 99;

interface UpdateCartItemQuantityParams {
	cartItemId: string;
	quantity: number;
}

export async function updateCartItemQuantity({
	cartItemId,
	quantity,
}: UpdateCartItemQuantityParams) {
	const validationT = await getTranslations('validation');
	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id;

	if (!userId) {
		return { guest: true };
	}

	const normalizedQty = Math.max(1, Math.floor(Number(quantity)));
	if (!cartItemId || !Number.isFinite(normalizedQty)) {
		return { success: false, message: validationT('cartUpdateFailed') };
	}

	try {
		const cart = await prisma.cart.findUnique({
			where: { userId },
			include: { items: true },
		});

		if (!cart) {
			return { success: false, message: validationT('cartNotFound') };
		}

		const existingItem = cart.items.find((item) => item.id === cartItemId);
		if (!existingItem) {
			return { success: false, message: validationT('productNotFoundInCart') };
		}

		const product = await prisma.product.findUnique({
			where: { id: existingItem.productId },
			select: { stock: true, inStock: true, status: true, publishStartAt: true, publishEndAt: true },
		});

		if (
			!product ||
			!product.inStock ||
			!isProductPublished(product.status, product.publishStartAt, product.publishEndAt)
		) {
			return { success: false, message: validationT('cartUpdateFailed') };
		}

		const availableStock = existingItem.variantId
			? (
					await prisma.productVariant.findUnique({
						where: { id: existingItem.variantId },
						select: { stock: true, productId: true },
					})
				)?.stock ?? 0
			: product.stock ?? 0;

		const safeQty = Math.min(MAX_ITEM_QUANTITY, Math.min(availableStock, normalizedQty));
			if (safeQty < 1) {
				return { success: false, message: validationT('cartUpdateFailed') };
			}

			await prisma.cartItem.update({
				where: { id: existingItem.id },
				data: { quantity: safeQty },
			});

			return { success: true, quantity: safeQty };
		} catch {
			return { success: false, message: validationT('cartUpdateFailed') };
		}
	}
