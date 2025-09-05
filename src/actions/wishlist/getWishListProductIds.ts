'use server';

import { prisma } from '@/lib/prisma';

export async function getWishListProductIds(userId: string) {
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
