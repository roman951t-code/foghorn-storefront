'use server';

import 'server-only';

import { prisma } from '@/lib/prisma';
import { getEffectiveDiscountPrice } from '@/utils/discountSchedule';

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
								discountStartAt: true,
								discountEndAt: true,
							},
						},
					},
				},
			},
		});

		const reshapedItems =
			cart?.items.map((item) => {
				const basePrice = item.product.basePrice?.toNumber?.() ?? 0;
				const discountPriceRaw = item.product.discountPrice?.toNumber?.() ?? null;
				const discountPrice = getEffectiveDiscountPrice(
					basePrice,
					discountPriceRaw,
					item.product.discountStartAt ?? null,
					item.product.discountEndAt ?? null
				);

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
