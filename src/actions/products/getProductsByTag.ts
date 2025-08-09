'use server';

import { prisma } from '@/lib/prisma';
import { Product, ProductsOnly, ProductsWithMeta, SubcategoryInfo } from '@/types/product';

export async function getProductsByTag<T extends boolean>(
	tag: string,
	fetchAll: T = false as T,
	limit: number = 12,
	offset: number = 0
): Promise<T extends true ? ProductsWithMeta : ProductsOnly> {
	const productsQuery = await prisma.product.findMany({
		where: {
			tags: { has: tag },
			inStock: true,
		},
		orderBy: [{ name: 'asc' }],
		skip: fetchAll ? 0 : offset,
		take: fetchAll ? undefined : Math.min(limit, 10),
		select: {
			id: true,
			name: true,
			slug: true,
			imageUrl: true,
			basePrice: true,
			discountPrice: true,
			inStock: true,
			reviews: { select: { rating: true } },
			category: {
				select: {
					slug: true,
					name: true,
					parent: {
						select: {
							slug: true,
							name: true,
						},
					},
				},
			},
		},
	});

	const products: Product[] = productsQuery.map((product) => {
		const ratings = product.reviews.map((r) => r.rating);
		const averageRating =
			ratings.length > 0 ? ratings.reduce((sum, val) => sum + val, 0) / ratings.length : 0;

		return {
			id: product.id,
			name: product.name,
			slug: product.slug,
			category: product.category.parent?.slug || '',
			subcategory: product.category.slug,
			imageUrl: product.imageUrl ?? '',
			inStock: product.inStock,
			basePrice: Number(product.basePrice),
			discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
			averageRating,
			reviewCount: product.reviews.length,
		};
	});

	if (!fetchAll) {
		return { products } as T extends true ? ProductsWithMeta : ProductsOnly;
	}

	const allMatchingProducts = await prisma.product.findMany({
		where: {
			tags: { has: tag },
			inStock: true,
		},
		select: {
			category: {
				select: {
					slug: true,
					name: true,
					parent: {
						select: {
							slug: true,
							name: true,
						},
					},
				},
			},
		},
	});

	const totalCount = allMatchingProducts.length;

	const uniqueSubcategoriesMap = new Map<string, SubcategoryInfo>();

	for (const p of allMatchingProducts) {
		const subcategorySlug = p.category.slug;
		if (!uniqueSubcategoriesMap.has(subcategorySlug)) {
			uniqueSubcategoriesMap.set(subcategorySlug, {
				categoryName: p.category.parent?.name || '',
				categorySlug: p.category.parent?.slug || '',
				subcategoryName: p.category.name,
				subcategorySlug: p.category.slug,
			});
		}
	}

	return {
		products,
		totalCount,
		subcategories: Array.from(uniqueSubcategoriesMap.values()),
	} as T extends true ? ProductsWithMeta : ProductsOnly;
}
