'use server';

import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function getWishListProductIds() {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session?.user?.id) {
		return { success: false, productIds: [] };
	}

	const wishlist = await prisma.wishlist.findMany({
		where: { userId: session.user.id },
		select: { productId: true },
	});

	return {
		success: true,
		productIds: wishlist?.map((item) => item.productId) ?? [],
	};
}
