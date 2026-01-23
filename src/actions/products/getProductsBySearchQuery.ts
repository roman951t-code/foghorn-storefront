'use server';
import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { SubcategoryProduct } from '@/types/product';
import { Prisma } from '@prisma/client';
import { PRODUCT_LIST_CACHE_TAG } from '@/constants/products';
import { getEffectiveDiscountPrice } from '@/utils/discountSchedule';

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
	'use cache';
	cacheLife('hours');
	cacheTag(PRODUCT_LIST_CACHE_TAG);

	const now = new Date();

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

	const whereClause: Prisma.ProductWhereInput = {
		name: { contains: searchQuery, mode: 'insensitive' },
		status: 'ACTIVE',
		...(inStock !== undefined ? { inStock } : {}),
		...(priceFilter
			? {
					OR: [
						{
							AND: [
								{ discountPrice: { not: null } },
								{
									OR: [
										{ discountStartAt: null, discountEndAt: null },
										{ discountStartAt: { lte: now }, discountEndAt: { gt: now } },
									],
								},
								{ discountPrice: priceFilter },
							],
						},
						{
							AND: [
								{
									OR: [
										{ discountPrice: null },
										{
											AND: [
												{ discountPrice: { not: null } },
												{
													OR: [
														{ discountStartAt: { gt: now } },
														{ discountEndAt: { lte: now } },
													],
												},
											],
										},
									],
								},
								{ basePrice: priceFilter },
							],
						},
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
		const category = p.category;
		if (!category?.slug) continue;
		const subcategorySlug = category.slug;
		if (!uniqueSubcategoriesMap.has(subcategorySlug)) {
			uniqueSubcategoriesMap.set(subcategorySlug, {
				categoryName: category.parent?.name || '',
				categorySlug: category.parent?.slug || '',
				subcategoryName: category.name || '',
				subcategorySlug,
			});
		}
	}

	const orderByClause: Prisma.ProductOrderByWithRelationInput[] = (() => {
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
			discountStartAt: true,
			discountEndAt: true,
			inStock: true,
			reviews: { select: { rating: true } },
		},
	});

	const productItems: SubcategoryProduct[] = products.map((product) => {
		const ratings = product.reviews?.map((r) => r.rating) ?? [];
		const averageRating =
			ratings.length > 0 ? ratings.reduce((sum, val) => sum + val, 0) / ratings.length : 0;

		const basePrice = Number(product.basePrice ?? 0);
		const scheduledDiscountPrice = getEffectiveDiscountPrice(
			basePrice,
			product.discountPrice != null ? Number(product.discountPrice) : null,
			product.discountStartAt ?? null,
			product.discountEndAt ?? null
		);

		return {
			...product,
			id: product.id ?? '',
			name: product.name ?? '',
			fullSlug: product.fullSlug ?? '',
			imageUrl: product.imageUrl ?? null,
			categoryName: product.categoryName ?? '',
			subcategoryName: product.subcategoryName ?? '',
			inStock: !!product.inStock,
			basePrice,
			discountPrice: scheduledDiscountPrice,
			averageRating,
			reviewCount: product.reviews?.length ?? 0,
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
