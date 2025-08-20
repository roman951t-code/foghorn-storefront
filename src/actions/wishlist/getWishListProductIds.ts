'use server';

import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function getWishListProductIds() {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session?.user?.id) {
		return { guest: true, productIds: [] };
	}

	const wishlist = await prisma.wishlist.findMany({
		where: { userId: session.user.id },
		select: { productId: true },
	});

	return wishlist?.map((item) => item.productId) ?? [];
}
