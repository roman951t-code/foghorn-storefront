'use server';

import { prisma } from '@/lib/prisma';
import { SubcategoryProduct } from '@/types/product';
import { unstable_cache } from 'next/cache';

export const getProductsBySubcategorySlug = unstable_cache(
	async (
		slug: string,
		limit = 12,
		offset = 0,
		onlyInStock?: boolean,
		minPrice?: number,
		maxPrice?: number
	) => {
		const subcategory = await prisma.productCategory.findUnique({
			where: { slug },
			include: { parent: true },
		});

		if (!subcategory) {
			return {
				categoryName: '',
				subcategoryName: '',
				products: [] as SubcategoryProduct[],
				totalCount: 0,
				maxProductPrice: 0,
			};
		}

		const priceFilter =
			minPrice !== undefined && maxPrice !== undefined
				? { gte: minPrice, lte: maxPrice }
				: minPrice !== undefined
					? { gte: minPrice }
					: maxPrice !== undefined
						? { lte: maxPrice }
						: undefined;

		const whereClause: any = {
			category: { slug },
			...(onlyInStock ? { inStock: true } : {}),
			...(priceFilter
				? {
						OR: [
							{ discountPrice: priceFilter },
							{
								AND: [{ discountPrice: null }, { basePrice: priceFilter }],
							},
						],
					}
				: {}),
		};

		const paginatedProducts = await prisma.product.findMany({
			where: whereClause,
			orderBy: [{ inStock: 'desc' }, { name: 'asc' }],
			skip: offset,
			take: limit,
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

		const totalCount = await prisma.product.count({ where: whereClause });

		const tagPriority = ['popular', 'new', 'discount', 'promotional'];

		const sortedProducts = paginatedProducts.sort((a, b) => {
			const aScore = Math.min(
				...tagPriority.map((tag, i) => (a.tags?.includes(tag) ? i : tagPriority.length))
			);
			const bScore = Math.min(
				...tagPriority.map((tag, i) => (b.tags?.includes(tag) ? i : tagPriority.length))
			);
			return aScore - bScore;
		});

		const products: SubcategoryProduct[] = sortedProducts.map((product) => {
			const ratings = product.reviews.map((r) => r.rating);
			const averageRating =
				ratings.length > 0
					? ratings.reduce((sum: number, val: number) => sum + val, 0) / ratings.length
					: 0;

			return {
				...product,
				basePrice: Number(product.basePrice),
				discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
				averageRating,
				reviewCount: product.reviews.length,
			} as SubcategoryProduct;
		});

		const maxPriceValue = paginatedProducts.reduce((max, product) => {
			const price = product.discountPrice ?? product.basePrice ?? 0;
			return Math.max(max, Number(price));
		}, 0);

		return {
			categoryName: subcategory.parent?.name || '',
			subcategoryName: subcategory.name,
			products,
			totalCount,
			maxProductPrice: maxPriceValue,
		};
	},
	['products-by-subcategory'],
	{
		tags: ['subcategory', 'products'],
	}
);
