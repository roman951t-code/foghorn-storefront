'use server';

import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function clearWishlist() {
	const t = await getTranslations('Wishlist');

	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id;

	if (!userId) {
		return { guest: true };
	}

	try {
		await prisma.wishlist.deleteMany({
			where: { userId },
		});

		return { success: true };
	} catch (error) {
		return { success: false, message: t('wishlistUpdateFailed') };
	}
}
