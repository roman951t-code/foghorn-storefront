'use server';

import { prisma } from '@/lib/prisma';
import {
	ProductsOnly,
	ProductsWithMeta,
	SubcategoryInfo,
	SubcategoryProduct,
} from '@/types/product';
import { unstable_cache } from 'next/cache';

export const getProductsByTag = unstable_cache(
	async <T extends boolean>(
		tag: string,
		fetchAll: T = false as T,
		limit = 12,
		offset = 0,
		minPrice?: number,
		maxPrice?: number
	): Promise<T extends true ? ProductsWithMeta : ProductsOnly> => {
		const priceFilter =
			minPrice !== undefined && maxPrice !== undefined
				? { gte: minPrice, lte: maxPrice }
				: minPrice !== undefined
					? { gte: minPrice }
					: maxPrice !== undefined
						? { lte: maxPrice }
						: undefined;

		const whereClause: any = {
			tags: { has: tag },
			inStock: true,
			...(priceFilter
				? {
						OR: [
							{ discountPrice: priceFilter },
							{ AND: [{ discountPrice: null }, { basePrice: priceFilter }] },
						],
					}
				: {}),
		};

		const productsQuery = await prisma.product.findMany({
			where: whereClause,
			orderBy: [{ name: 'asc' }],
			skip: fetchAll ? 0 : offset,
			take: fetchAll ? undefined : Math.min(limit, 10),
			select: {
				id: true,
				name: true,
				fullSlug: true,
				imageUrl: true,
				basePrice: true,
				categoryName: true,
				subcategoryName: true,
				discountPrice: true,
				inStock: true,
				reviews: { select: { rating: true } },
				tags: true,
			},
		});

		const maxProductPrice = productsQuery.reduce((max, product) => {
			const price = product.discountPrice ?? product.basePrice ?? 0;
			return Math.max(max, Number(price));
		}, 0);

		const products = productsQuery.map((product) => {
			const ratings = product.reviews.map((r) => r.rating);
			const averageRating =
				ratings.length > 0 ? ratings.reduce((sum, val) => sum + val, 0) / ratings.length : 0;

			return {
				...product,
				basePrice: Number(product.basePrice),
				discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
				averageRating,
				reviewCount: product.reviews.length,
			} as SubcategoryProduct;
		});

		if (!fetchAll) {
			return { products, maxProductPrice } as T extends true ? ProductsWithMeta : ProductsOnly;
		}

		const allMatchingProducts = await prisma.product.findMany({
			where: whereClause,
			select: {
				category: {
					select: {
						slug: true,
						name: true,
						parent: {
							select: { slug: true, name: true },
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
			maxProductPrice,
		} as T extends true ? ProductsWithMeta : ProductsOnly;
	},
	['products-by-tag'],
	{ tags: ['products'] }
);
