'use server';

import { prisma } from '@/lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';

export async function getCartProductIds(userId: string) {
	noStore();

	if (!userId) {
		return { success: false, productIds: [] };
	}

	const cart = await prisma.cart.findUnique({
		where: { userId },
		include: { items: { select: { productId: true } } },
	});

	return {
		success: true,
		productIds: cart?.items.map((item) => item.productId) ?? [],
	};
}
