'use server';

import 'server-only';

import * as Sentry from '@sentry/nextjs';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { isProductPublished } from '@/utils/publishSchedule';

export async function addToWishList(productId: string) {
	const wishlistT = await getTranslations('wishlist');

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
			// "Add to wishlist" is idempotent; keep existing row.
			return { success: true };
		}

		const product = await prisma.product.findUnique({
			where: { id: productId },
			select: { id: true, status: true, publishStartAt: true, publishEndAt: true },
		});

		if (
			!product ||
			!isProductPublished(product.status, product.publishStartAt, product.publishEndAt)
		) {
			return { success: false, message: wishlistT('wishlistUpdateFailed') };
		}

		await prisma.wishlist.create({
			data: {
				userId,
				productId,
			},
		});

		return { success: true };
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
			// Concurrent insert race: row already exists, which is a successful add.
			return { success: true };
		}
		Sentry.captureException(error, { tags: { wishlistAction: 'add-to-wishlist' } });
		return { success: false, message: wishlistT('wishlistUpdateFailed') };
	}
}
