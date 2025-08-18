'use server';

import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function getCartItems() {
	const session = await auth.api.getSession({ headers: await headers() });

	try {
		const cart = await prisma.cart.findUnique({
			where: { userId: session?.user.id },
			include: {
				items: {
					include: {
						product: {
							select: {
								id: true,
								name: true,
								fullSlug: true,
								imageUrl: true,
								basePrice: true,
								discountPrice: true,
							},
						},
					},
				},
			},
		});

		const reshapedItems =
			cart?.items.map((item) => {
				const basePrice = item.product.basePrice?.toNumber?.() ?? 0;
				const discountPrice = item.product.discountPrice?.toNumber?.() ?? null;

				return {
					...item.product,
					quantity: item.quantity,
					basePrice,
					discountPrice,
				};
			}) ?? [];

		return { success: true, items: reshapedItems };
	} catch (error) {
		return {
			success: false,
			items: [],
		};
	}
}
