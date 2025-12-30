'use server';

import 'server-only';

import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

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

		const product = await prisma.product.findUnique({
			where: { id: productId },
			select: { id: true, inStock: true },
		});

		if (!product || !product.inStock) {
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
		return { success: false, message: wishlistT('wishlistUpdateFailed') };
	}
}
