'use server';

import { prisma } from '@/lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';

export async function getWishListProductIds(userId: string) {
	noStore();

	if (!userId) {
		return { success: false, productIds: [] };
	}

	const wishlist = await prisma.wishlist.findMany({
		where: { userId },
		select: { productId: true },
	});

	return {
		success: true,
		productIds: wishlist?.map((item) => item.productId) ?? [],
	};
}
