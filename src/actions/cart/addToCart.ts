'use server';

import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function addToCart(productIds: string | string[]) {
	const t = await getTranslations('Validation');
	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id;

	if (!userId) {
		return { guest: true };
	}

	try {
		const ids = Array.isArray(productIds) ? productIds : [productIds];

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

		const existingIds = cart.items.map((item) => item.productId);
		const newIds = ids.filter((id) => !existingIds.includes(id));

		for (const id of newIds) {
			await prisma.cartItem.create({
				data: {
					cartId: cart.id,
					productId: id,
					quantity: 1,
				},
			});
		}

		return { success: true, added: newIds.length };
	} catch (error) {
		return { success: false, message: (error as Error).message || t('cartUpdateFailed') };
	}
}
