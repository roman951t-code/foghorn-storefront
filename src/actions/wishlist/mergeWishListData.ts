'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';

export async function mergeWishListData(localItems: { id: string }[]) {
	const t = await getTranslations('wishlist');

	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id;

	if (!userId) return { success: false };

	try {
		const existing = await prisma.wishlist.findMany({
			where: { userId },
		});

		for (const localItem of localItems) {
			const productId = localItem.id;
			if (!productId) continue;

			const alreadyInWishlist = existing.find((w) => w.productId === productId);
			if (!alreadyInWishlist) {
				await prisma.wishlist.create({
					data: { userId, productId },
				});
			}
		}

		return { success: true };
	} catch (error) {
		return { success: false, message: t('wishlistUpdateFailed') };
	}
}
