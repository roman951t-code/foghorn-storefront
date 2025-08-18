'use server';

import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

interface UpdateCartItemQuantityParams {
	productId: string;
	quantity: number;
}

export async function updateCartItemQuantity({
	productId,
	quantity,
}: UpdateCartItemQuantityParams) {
	const t = await getTranslations('Validation');
	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id;

	if (!userId) {
		return { guest: true };
	}

	const normalizedQty = Math.max(1, Math.floor(Number(quantity)));
	if (!productId || !Number.isFinite(normalizedQty)) {
		return { success: false, message: t('cartUpdateFailed') };
	}

	try {
		const cart = await prisma.cart.findUnique({
			where: { userId },
			include: { items: true },
		});

		if (!cart) {
			return { success: false, message: t('cartNotFound') };
		}

		const existingItem = cart.items.find((item) => item.productId === productId);
		if (!existingItem) {
			return { success: false, message: t('productNotFoundInCart') };
		}

		await prisma.cartItem.update({
			where: { id: existingItem.id },
			data: { quantity: normalizedQty },
		});

		return { success: true };
	} catch {
		return { success: false, message: t('cartUpdateFailed') };
	}
}
