'use server';

import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';

export async function getCartItems() {
	const t = await getTranslations('Validation');
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session?.user?.id) {
		return { guest: true };
	}

	try {
		const cart = await prisma.cart.findUnique({
			where: { userId: session.user.id },
			include: {
				items: {
					include: {
						product: {
							select: {
								id: true,
								name: true,
								slug: true,
								imageUrl: true,
								basePrice: true,
								discountPrice: true,
								tags: true,
								category: {
									select: {
										slug: true,
										parent: { select: { slug: true } },
									},
								},
							},
						},
					},
				},
			},
		});

		const reshapedItems =
			cart?.items.map((item) => {
				const { category, ...restProduct } = item.product;
				return {
					...restProduct,
					quantity: item.quantity,
					subcategory: category.slug,
					category: category.parent?.slug || null,
					basePrice: item.product.basePrice?.toNumber?.() ?? null,
					discountPrice: item.product.discountPrice?.toNumber?.() ?? null,
				};
			}) ?? [];

		return { success: true, items: reshapedItems };
	} catch (error) {
		return {
			success: false,
			message: (error as Error).message || t('cartFetchFailed'),
		};
	}
}
