'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';

export async function mergeCartData(localItems: { id: string; quantity: number }[]) {
	const t = await getTranslations('cart');

	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id;

	if (!userId) {
		return { success: false };
	}

	try {
		let cart = await prisma.cart.findUnique({
			where: { userId },
			include: { items: true },
		});

		if (!cart) {
			cart = await prisma.cart.create({
				data: { userId },
				include: { items: true },
			});
		}

		for (const localItem of localItems) {
			const productId = localItem.id;

			if (!productId) continue;

			const existingItem = cart.items.find((item) => item.productId === productId);

			if (existingItem) {
				await prisma.cartItem.update({
					where: { id: existingItem.id },
					data: { quantity: existingItem.quantity + localItem.quantity },
				});
			} else {
				await prisma.cartItem.create({
					data: {
						cartId: cart.id,
						productId,
						quantity: localItem.quantity,
					},
				});
			}
		}

		return { success: true };
	} catch (error) {
		return { success: false, message: t('cartUpdateFailed') };
	}
}
