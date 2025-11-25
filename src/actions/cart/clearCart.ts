'use server';

import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';

export async function clearCart() {
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

		await prisma.cartItem.deleteMany({
			where: { cartId: cart.id },
		});

		return { success: true };
	} catch (error) {
		return {
			success: false,
			message: t('cartUpdateFailed'),
		};
	}
}
