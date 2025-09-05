'use server';

import { prisma } from '@/lib/prisma';

export async function getCartItems(userId: string) {
	if (!userId) {
		return { success: false, items: [] };
	}

	try {
		const cart = await prisma.cart.findUnique({
			where: { userId },
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
