'use server';

import 'server-only';

import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';

interface RemoveCartItemParams {
	productId?: string;
	cartItemId?: string;
}

export async function removeFromCart({ productId, cartItemId }: RemoveCartItemParams) {
	const cartT = await getTranslations('cart');
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
			return { success: false, message: cartT('cartNotFound') };
		}

		if (cartItemId) {
			const existingItem = cart.items.find((item) => item.id === cartItemId);

			if (!existingItem) {
				return { success: false, message: cartT('productNotFoundInCart') };
			}

			await prisma.cartItem.delete({
				where: { id: existingItem.id },
			});

			return { success: true };
		} else {
			if (productId) {
				await prisma.cartItem.deleteMany({
					where: { cartId: cart.id, productId },
				});
			} else {
				await prisma.cartItem.deleteMany({
					where: { cartId: cart.id },
				});
			}

			return { success: true };
		}
	} catch (error) {
		return { success: false, message: cartT('cartUpdateFailed') };
	}
}
