'use server';

import 'server-only';

import * as Sentry from '@sentry/nextjs';
import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function removeFromWishList(productId: string) {
	const wishlistT = await getTranslations('wishlist');

	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id;

	if (!userId) {
		return { guest: true };
	}

	try {
		await prisma.wishlist.deleteMany({
			where: {
				userId,
				productId,
			},
		});
		return { success: true };
	} catch (error) {
		Sentry.captureException(error, { tags: { wishlistAction: 'remove-from-wishlist' } });
		return { success: false, message: wishlistT('wishlistUpdateFailed') };
	}
}
