'use server';

import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { SubcategoryProduct } from '@/types/product';
import { Prisma } from '@prisma/client';
import { buildProductImages } from '@/utils/productImages';
import { getEffectiveDiscountPrice } from '@/utils/discountSchedule';
import { PRODUCT_CATEGORY_CACHE_TAG, PRODUCT_LIST_CACHE_TAG } from '@/constants/products';

export async function getProductsBySubcategorySlug(
	slug: string,
	limit = 12,
	offset = 0,
	onlyInStock?: boolean,
	inStock?: boolean,
	minPrice?: number,
	maxPrice?: number,
	orderBy?: 'new' | 'expensive' | 'cheap',
	filters?: Record<string, string[]>
) {
	'use cache';
	cacheLife('hours');
	cacheTag(PRODUCT_LIST_CACHE_TAG, PRODUCT_CATEGORY_CACHE_TAG);

	const subcategory = await prisma.productCategory.findUnique({
		where: { slug },
		select: {
			name: true,
			parent: { select: { name: true } },
		},
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

	const now = new Date();

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
		category: { slug },
		status: 'ACTIVE',
		...(onlyInStock ? { inStock: true } : {}),
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

	const paginatedProducts = await prisma.product.findMany({
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
			tags: true,
		},
	});

	const totalCount = await prisma.product.count({ where: whereClause });

	let finalProducts = paginatedProducts;
	if (!orderBy) {
		const tagPriority = ['popular', 'new', 'discount', 'promotional'];
		finalProducts = [...paginatedProducts].sort((a, b) => {
			const score = (p: typeof a) =>
				Math.min(...tagPriority.map((t, i) => (p.tags?.includes(t) ? i : tagPriority.length)));
			return score(a) - score(b);
		});
	}

	const products: SubcategoryProduct[] = finalProducts.map((p) => {
		const ratings = p.reviews?.map((r) => r.rating) ?? [];
		const averageRating = ratings.length ? ratings.reduce((s, v) => s + v, 0) / ratings.length : 0;

		const basePrice = Number(p.basePrice ?? 0);
		const scheduledDiscountPrice = getEffectiveDiscountPrice(
			basePrice,
			p.discountPrice != null ? Number(p.discountPrice) : null,
			p.discountStartAt ?? null,
			p.discountEndAt ?? null
		);

		return {
			...p,
			id: p.id ?? '',
			name: p.name ?? '',
			fullSlug: p.fullSlug ?? '',
			imageUrl: p.imageUrl ?? null,
			images: buildProductImages(p.imageUrl ?? undefined, 4),
			categoryName: p.categoryName ?? '',
			subcategoryName: p.subcategoryName ?? '',
			inStock: !!p.inStock,
			basePrice,
			discountPrice: scheduledDiscountPrice,
			averageRating,
			reviewCount: p.reviews?.length ?? 0,
		} as SubcategoryProduct;
	});

	const maxProductPrice = paginatedProducts.reduce((max, p) => {
		const basePrice = Number(p.basePrice ?? 0);
		const discountPrice = getEffectiveDiscountPrice(
			basePrice,
			p.discountPrice != null ? Number(p.discountPrice) : null,
			p.discountStartAt ?? null,
			p.discountEndAt ?? null
		);
		const price = discountPrice ?? basePrice;
		return Math.max(max, Number(price));
	}, 0);

	return {
		categoryName: subcategory.parent?.name || '',
		subcategoryName: subcategory.name,
		products,
		totalCount,
		maxProductPrice,
	};
}
