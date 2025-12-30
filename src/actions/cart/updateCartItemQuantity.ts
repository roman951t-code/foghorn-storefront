'use server';

import 'server-only';

import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const MAX_ITEM_QUANTITY = 99;

interface UpdateCartItemQuantityParams {
	productId: string;
	quantity: number;
}

export async function updateCartItemQuantity({
	productId,
	quantity,
}: UpdateCartItemQuantityParams) {
	const validationT = await getTranslations('validation');
	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id;

	if (!userId) {
		return { guest: true };
	}

	const normalizedQty = Math.max(1, Math.floor(Number(quantity)));
	if (!productId || !Number.isFinite(normalizedQty)) {
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

		const existingItem = cart.items.find((item) => item.productId === productId);
		if (!existingItem) {
			return { success: false, message: validationT('productNotFoundInCart') };
		}

		const product = await prisma.product.findUnique({
			where: { id: productId },
			select: { stock: true, inStock: true },
		});

		if (!product || !product.inStock || !product.stock) {
			return { success: false, message: validationT('cartUpdateFailed') };
		}

		const safeQty = Math.min(MAX_ITEM_QUANTITY, Math.min(product.stock, normalizedQty));
		if (safeQty < 1) {
			return { success: false, message: validationT('cartUpdateFailed') };
		}

		await prisma.cartItem.update({
			where: { id: existingItem.id },
			data: { quantity: safeQty },
		});

		return { success: true };
	} catch {
		return { success: false, message: validationT('cartUpdateFailed') };
	}
}
