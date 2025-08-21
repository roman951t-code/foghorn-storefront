'use server';

import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function getCartProductIds() {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session?.user?.id) {
		return { success: false, productIds: [] };
	}

	const cart = await prisma.cart.findUnique({
		where: { userId: session.user.id },
		include: { items: { select: { productId: true } } },
	});

	return {
		success: true,
		productIds: cart?.items.map((item) => item.productId) ?? [],
	};
}
