'use server';
import { prisma } from '@/lib/prisma';
import { SubcategoryProduct } from '@/types/product';

export async function getProductsBySearchQuery(
	searchQuery: string,
	limit: number = 12,
	offset: number = 0,
	minPrice?: number,
	maxPrice?: number,
	inStock?: boolean,
	orderBy?: 'new' | 'expensive' | 'cheap',
	filters?: Record<string, string[]>
): Promise<{
	products: SubcategoryProduct[];
	totalCount: number;
	subcategories: {
		categoryName: string;
		categorySlug: string;
		subcategoryName: string;
		subcategorySlug: string;
	}[];
	maxProductPrice: number;
}> {
	const priceFilter =
		minPrice !== undefined && maxPrice !== undefined
			? { gte: minPrice, lte: maxPrice }
			: minPrice !== undefined
				? { gte: minPrice }
				: maxPrice !== undefined
					? { lte: maxPrice }
					: undefined;

	const dynamicConditions = filters
		? Object.entries(filters).map(([key, values]) => ({
				attributes: {
					some: {
						attribute: { name: key },
						value: { in: values.flat() },
					},
				},
			}))
		: [];

	const whereClause: any = {
		name: { contains: searchQuery, mode: 'insensitive' },
		...(inStock !== undefined ? { inStock } : {}),
		...(priceFilter
			? {
					OR: [
						{ discountPrice: priceFilter },
						{ AND: [{ discountPrice: null }, { basePrice: priceFilter }] },
					],
				}
			: {}),
		...(dynamicConditions.length > 0 ? { AND: dynamicConditions } : {}),
	};

	const allMatchingProducts = await prisma.product.findMany({
		where: whereClause,
		select: {
			category: {
				select: {
					slug: true,
					name: true,
					parent: { select: { slug: true, name: true } },
				},
			},
		},
	});

	const totalCount = allMatchingProducts.length;

	const uniqueSubcategoriesMap = new Map<
		string,
		{
			categoryName: string;
			categorySlug: string;
			subcategoryName: string;
			subcategorySlug: string;
		}
	>();

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

	const orderByClause: any[] = (() => {
		switch (orderBy) {
			case 'new':
				return [{ createdAt: 'desc' }];
			case 'expensive':
				return [{ basePrice: 'desc' }];
			case 'cheap':
				return [{ basePrice: 'asc' }];
			default:
				return [{ inStock: 'desc' }, { name: 'asc' }];
		}
	})();

	const products = await prisma.product.findMany({
		where: whereClause,
		orderBy: orderByClause,
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
			createdAt: true,
		},
	});

	const productItems: SubcategoryProduct[] = products.map((product) => {
		const ratings = product.reviews.map((r) => r.rating);
		const averageRating =
			ratings.length > 0 ? ratings.reduce((sum, val) => sum + val, 0) / ratings.length : 0;

		return {
			...product,
			basePrice: Number(product.basePrice),
			discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
			averageRating,
			reviewCount: product.reviews.length,
		};
	});

	const maxPriceValue = productItems.reduce((max, product) => {
		const price = product.discountPrice ?? product.basePrice ?? 0;
		return Math.max(max, Number(price));
	}, 0);

	return {
		products: productItems,
		totalCount,
		subcategories: Array.from(uniqueSubcategoriesMap.values()),
		maxProductPrice: maxPriceValue,
	};
}
