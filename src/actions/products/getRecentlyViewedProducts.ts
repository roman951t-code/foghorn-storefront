'use server';

import 'server-only';

import { DEFAULT_LOCALE } from '@/constants/locales';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { SubcategoryProduct } from '@/types/product';
import {
	getEffectiveDiscountPrice,
	getEffectiveVariantDiscountPrice,
} from '@/utils/discountSchedule';
import { getLocaleFallbacks, pickLocalizedTranslation } from '@/utils/localeFallback';
import {
	buildProductImageGallery,
	resolveProductPrimaryImageFromGallery,
} from '@/utils/productImages';
import { getPublishedProductWhere } from '@/utils/publishSchedule';
import { buildLocalizedVariantLabel } from '@/utils/attributeLocalization';

function mapRecentlyViewedProducts(
	viewed: { product: any }[],
	locale: string,
): SubcategoryProduct[] {
	const mapped = viewed.map((entry) => {
		const p = entry.product;
		if (!p) return null;
		const translation = pickLocalizedTranslation(
			p.translations as
				| Array<{
						locale: string;
						name: string;
						categoryName: string | null;
						subcategoryName: string | null;
				  }>
				| undefined,
			locale,
		);
		const productBasePrice = Number(p.basePrice ?? 0);
		const defaultVariant = p.variants?.[0];
		const basePrice = defaultVariant
			? (defaultVariant.price?.toNumber?.() ?? Number(defaultVariant.price ?? 0))
			: productBasePrice;
		const persistedImages =
			p.productImages?.map((image: { url: string }) => image.url).filter(Boolean) ?? [];
		const primaryImageUrl = resolveProductPrimaryImageFromGallery(p.imageUrl, persistedImages);
		const images = buildProductImageGallery(p.imageUrl, persistedImages, 4);
		const scheduledDiscountPrice = defaultVariant
			? getEffectiveVariantDiscountPrice({
					variantBasePrice: basePrice,
					variantDiscountPrice: defaultVariant.discountPrice?.toNumber?.() ?? null,
					variantDiscountStartAt: defaultVariant.discountStartAt ?? null,
					variantDiscountEndAt: defaultVariant.discountEndAt ?? null,
					productBasePrice,
					productDiscountPrice: p.discountPrice != null ? Number(p.discountPrice) : null,
					productDiscountStartAt: p.discountStartAt ?? null,
					productDiscountEndAt: p.discountEndAt ?? null,
				})
			: getEffectiveDiscountPrice(
					productBasePrice,
					p.discountPrice != null ? Number(p.discountPrice) : null,
					p.discountStartAt ?? null,
					p.discountEndAt ?? null,
				);

		return {
			id: p.id ?? '',
			name: translation?.name ?? p.name ?? '',
			fullSlug: p.fullSlug ?? '',
			imageUrl: primaryImageUrl,
			images,
			categoryName: translation?.categoryName ?? p.categoryName ?? '',
			subcategoryName: translation?.subcategoryName ?? p.subcategoryName ?? '',
			inStock: !!p.inStock,
			averageRating: p.averageRating ?? 0,
			reviewCount: p.reviewCount ?? 0,
			basePrice,
			discountPrice: scheduledDiscountPrice,
			defaultVariant: p.variants?.[0]
				? {
						id: p.variants[0].id,
						sku: p.variants[0].sku,
						price: p.variants[0].price?.toNumber?.() ?? Number(p.variants[0].price ?? 0),
						discountPrice: getEffectiveVariantDiscountPrice({
							variantBasePrice:
								p.variants[0].price?.toNumber?.() ?? Number(p.variants[0].price ?? 0),
							variantDiscountPrice: p.variants[0].discountPrice?.toNumber?.() ?? null,
							variantDiscountStartAt: p.variants[0].discountStartAt ?? null,
							variantDiscountEndAt: p.variants[0].discountEndAt ?? null,
							productBasePrice,
							productDiscountPrice: p.discountPrice != null ? Number(p.discountPrice) : null,
							productDiscountStartAt: p.discountStartAt ?? null,
							productDiscountEndAt: p.discountEndAt ?? null,
						}),
						stock: p.variants[0].stock,
						label:
							buildLocalizedVariantLabel(
								(p.variants[0].attributes ?? []).map((a: any) => ({
									name: a.attribute?.name,
									value: a.value,
									unit: a.attribute?.unit,
								})),
								locale
							) ?? '',
					}
				: undefined,
		} as SubcategoryProduct;
	});

	return mapped.filter((item): item is SubcategoryProduct => item !== null);
}

export async function getRecentlyViewedProductsWithCount(
	userId: string,
	limit = 10,
	offset = 0,
	locale: string = DEFAULT_LOCALE,
	minPrice?: number,
	maxPrice?: number,
	inStock?: boolean,
	orderBy?: 'new' | 'expensive' | 'cheap',
	filters?: Record<string, string[]>,
): Promise<{ products: SubcategoryProduct[]; totalCount: number; maxProductPrice: number }> {
	if (!userId) return { products: [], totalCount: 0, maxProductPrice: 0 };

	const localeFallbacks = getLocaleFallbacks(locale);
	const safeLimit = Math.min(50, Math.max(1, Math.floor(limit || 1)));
	const safeOffset = Math.max(0, Math.floor(offset || 0));
	const now = new Date();

	const priceFilter =
		minPrice !== undefined && maxPrice !== undefined
			? { gte: minPrice, lte: maxPrice }
			: minPrice !== undefined
				? { gte: minPrice }
				: maxPrice !== undefined
					? { lte: maxPrice }
					: undefined;

	const brandFilters = (filters?.brand ?? []).flat().filter(Boolean);
	const attributeFilters = filters
		? Object.entries(filters).filter(([key]) => key !== 'brand')
		: [];
	const dynamicConditions = attributeFilters.map(([key, values]) => ({
		attributes: {
			// key is the attribute's id — see getProductsBySubcategorySlug.ts for why.
			some: { attributeId: key, value: { in: values.flat() } },
		},
	}));

	// Same filter shape as getProductsByTag/getProductsBySubcategorySlug, applied
	// to the recently-viewed product set instead of a category/tag — this is
	// what makes the "recently viewed" list support the same brand/attribute/
	// price/in-stock filters as every other product listing.
	const productWhere: Prisma.ProductWhereInput = {
		...(brandFilters.length > 0 ? { brand: { slug: { in: brandFilters } } } : {}),
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
		AND: [getPublishedProductWhere(now), ...(dynamicConditions.length > 0 ? dynamicConditions : [])],
	};

	const recentlyViewedWhere: Prisma.RecentlyViewedWhereInput = {
		userId,
		product: {
			is: productWhere,
		},
	};

	const isEffectivePriceSort = orderBy === 'cheap' || orderBy === 'expensive';
	const orderByClause: Prisma.RecentlyViewedOrderByWithRelationInput[] =
		orderBy === 'new'
			? [{ product: { inStock: 'desc' } }, { product: { createdAt: 'desc' } }]
			: isEffectivePriceSort
				? [
						{ product: { inStock: 'desc' } },
						{ product: { sortPrice: orderBy === 'cheap' ? 'asc' : 'desc' } },
					]
				: // No explicit sort chosen — recency of viewing is this list's whole
					// identity, unlike catalog listings that default to popularity.
					// In-stock items first, globally — sorting in JS after skip/take
					// would only reorder within whatever page happened to be fetched,
					// letting an out-of-stock item outrank an in-stock one a page later.
					[{ product: { inStock: 'desc' } }, { updatedAt: 'desc' }];

	const [totalCount, viewed, maxPriceAggregate] = await Promise.all([
		prisma.recentlyViewed.count({ where: recentlyViewedWhere }),
		prisma.recentlyViewed.findMany({
			where: recentlyViewedWhere,
			orderBy: orderByClause,
			skip: safeOffset,
			take: safeLimit,
			include: {
				product: {
					select: {
						id: true,
						name: true,
						fullSlug: true,
						imageUrl: true,
						productImages: {
							select: { url: true, sortOrder: true, createdAt: true },
							orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
							take: 6,
						},
						basePrice: true,
						discountPrice: true,
						discountStartAt: true,
						discountEndAt: true,
						inStock: true,
						categoryName: true,
						subcategoryName: true,
						translations: {
							where: { locale: { in: localeFallbacks } },
							select: { locale: true, name: true, categoryName: true, subcategoryName: true },
							orderBy: { updatedAt: 'desc' },
						},
						averageRating: true,
						reviewCount: true,
						variants: {
							where: { stock: { gt: 0 } },
							orderBy: [{ price: 'asc' }, { createdAt: 'asc' }],
							take: 1,
							select: {
								id: true,
								sku: true,
								price: true,
								discountPrice: true,
								discountStartAt: true,
								discountEndAt: true,
								stock: true,
								attributes: {
									select: {
										attribute: { select: { name: true, unit: true } },
										value: true,
									},
									orderBy: { attribute: { name: 'asc' } },
								},
							},
						},
					},
				},
			},
		}),
		prisma.product.aggregate({
			where: { ...productWhere, recentlyViewed: { some: { userId } } },
			_max: { sortPrice: true },
		}),
	]);

	const maxProductPrice = maxPriceAggregate._max.sortPrice?.toNumber() ?? 0;

	return { products: mapRecentlyViewedProducts(viewed, locale), totalCount, maxProductPrice };
}

export async function getRecentlyViewedProducts(
	userId: string,
	limit = 32,
	offset = 0,
	locale: string = DEFAULT_LOCALE,
) {
	const { products } = await getRecentlyViewedProductsWithCount(userId, limit, offset, locale);
	return products;
}
