'use server';

import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function addToWishList(productId: string) {
	const t = await getTranslations('Wishlist');

	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id;
	if (!userId) {
		return { guest: true };
	}

	try {
		const existing = await prisma.wishlist.findUnique({
			where: {
				userId_productId: {
					userId,
					productId,
				},
			},
		});

		if (existing) {
			await prisma.wishlist.delete({
				where: {
					userId_productId: {
						userId,
						productId,
					},
				},
			});
			return { success: true };
		}

		await prisma.wishlist.create({
			data: {
				userId,
				productId,
			},
		});

		return { success: true };
	} catch (error) {
		return { success: false, message: t('wishlistUpdateFailed') };
	}
}
