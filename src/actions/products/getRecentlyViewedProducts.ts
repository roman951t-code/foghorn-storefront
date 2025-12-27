'use server';

import { prisma } from '@/lib/prisma';
import { SubcategoryProduct } from '@/types/product';
import { unstable_noStore as noStore } from 'next/cache';

function mapRecentlyViewedProducts(viewed: { product: any }[]): SubcategoryProduct[] {
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

export async function getRecentlyViewedProductsWithCount(
	userId: string,
	limit = 10,
	offset = 0
): Promise<{ products: SubcategoryProduct[]; totalCount: number }> {
	noStore();

	if (!userId) return { products: [], totalCount: 0 };

	const safeLimit = Math.min(50, Math.max(1, Math.floor(limit || 1)));
	const safeOffset = Math.max(0, Math.floor(offset || 0));

	const [totalCount, viewed] = await prisma.$transaction([
		prisma.recentlyViewed.count({ where: { userId } }),
		prisma.recentlyViewed.findMany({
			where: { userId },
			orderBy: { updatedAt: 'desc' },
			skip: safeOffset,
			take: safeLimit,
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
		}),
	]);

	return { products: mapRecentlyViewedProducts(viewed), totalCount };
}

export async function getRecentlyViewedProducts(userId: string, limit = 32, offset = 0) {
	noStore();

	const { products } = await getRecentlyViewedProductsWithCount(userId, limit, offset);
	return products;
}
