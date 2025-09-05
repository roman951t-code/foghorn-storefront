'use server';

import { prisma } from '@/lib/prisma';

export async function getCartProductIds(userId: string) {
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
