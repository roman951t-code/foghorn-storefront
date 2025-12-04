'use server';

import { prisma } from '@/lib/prisma';
import { SubcategoryProduct } from '@/types/product';

export async function getRecentlyViewedProducts(userId: string, limit = 16) {
	if (!userId) return [];

	const viewed = await prisma.recentlyViewed.findMany({
		where: { userId },
		orderBy: { updatedAt: 'desc' },
		take: limit,
		include: {
			product: {
				select: {
					id: true,
					name: true,
					fullSlug: true,
					imageUrl: true,
					basePrice: true,
					discountPrice: true,
					inStock: true,
					categoryName: true,
					subcategoryName: true,
					averageRating: true,
					reviewCount: true,
				},
			},
		},
	});

	return viewed
		.map((entry) => {
			const p = entry.product;
			if (!p) return null;
			return {
				id: p.id ?? '',
				name: p.name ?? '',
				fullSlug: p.fullSlug ?? '',
				imageUrl: p.imageUrl ?? null,
				categoryName: p.categoryName ?? '',
				subcategoryName: p.subcategoryName ?? '',
				inStock: !!p.inStock,
				averageRating: p.averageRating ?? 0,
				reviewCount: p.reviewCount ?? 0,
				basePrice: Number(p.basePrice ?? 0),
				discountPrice: p.discountPrice != null ? Number(p.discountPrice) : null,
			} as SubcategoryProduct;
		})
		.filter(Boolean) as SubcategoryProduct[];
}
