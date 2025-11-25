'use server';

import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';

interface RemoveCartItemParams {
	productId?: string;
}

export async function removeFromCart({ productId }: RemoveCartItemParams) {
	const t = await getTranslations('cart');
	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id;

	if (!userId) {
		return { guest: true };
	}

	try {
		const cart = await prisma.cart.findUnique({
			where: { userId },
			include: { items: true },
		});

		if (!cart) {
			return { success: false, message: t('cartNotFound') };
		}

		if (productId) {
			const existingItem = cart.items.find((item) => item.productId === productId);

			if (!existingItem) {
				return { success: false, message: t('productNotFoundInCart') };
			}

			await prisma.cartItem.delete({
				where: { id: existingItem.id },
			});

			return { success: true };
		} else {
			await prisma.cartItem.deleteMany({
				where: { cartId: cart.id },
			});

			return { success: true };
		}
	} catch (error) {
		return { success: false, message: t('cartUpdateFailed') };
	}
}
