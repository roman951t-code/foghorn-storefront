'use server';
import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';
import { DEFAULT_LOCALE } from '@/constants/locales';
import { prisma } from '@/lib/prisma';
import { SubcategoryProduct } from '@/types/product';
import { Prisma } from '@prisma/client';
import { PRODUCT_LIST_CACHE_TAG, productCacheTagById } from '@/constants/products';
import {
	buildProductImageGallery,
	resolveProductPrimaryImageFromGallery,
} from '@/utils/productImages';
import {
	getEffectiveDiscountPrice,
	getEffectiveVariantDiscountPrice,
} from '@/utils/discountSchedule';
import { getLocaleFallbacks, pickLocalizedTranslation } from '@/utils/localeFallback';
import { getPublishedProductWhere } from '@/utils/publishSchedule';
import { getMaxEffectiveProductPrice } from '@/utils/maxEffectiveProductPrice';
import { MAX_PRODUCTS_PER_PAGE } from '@/constants/pagination';
import { getPaginatedIdsByEffectivePriceSort } from '@/utils/effectivePriceSorting';
import { getAttributeNameCandidatesForFilterKey } from '@/utils/attributeLocalization';

export async function getProductsBySearchQuery(
	searchQuery: string,
	limit: number = 12,
	offset: number = 0,
	minPrice?: number,
	maxPrice?: number,
	inStock?: boolean,
	orderBy?: 'new' | 'expensive' | 'cheap',
	filters?: Record<string, string[]>,
	locale: string = DEFAULT_LOCALE
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

	const safeLimit = Math.min(MAX_PRODUCTS_PER_PAGE, Math.max(1, Math.floor(limit || 1)));
	const safeOffset = Math.max(0, Math.floor(offset || 0));

	const localeFallbacks = getLocaleFallbacks(locale);
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
			some: {
				attribute: { name: { in: getAttributeNameCandidatesForFilterKey(key) } },
				value: { in: values.flat() },
			},
		},
	}));

	const normalizedSearchQuery = searchQuery.trim();
	const searchCondition: Prisma.ProductWhereInput | undefined = normalizedSearchQuery
		? {
				OR: [
					{ name: { contains: normalizedSearchQuery, mode: 'insensitive' } },
					{
						translations: {
							some: {
								locale: { in: localeFallbacks },
								name: { contains: normalizedSearchQuery, mode: 'insensitive' },
							},
						},
					},
				],
			}
		: undefined;
	const combinedConditions: Prisma.ProductWhereInput[] = [
		getPublishedProductWhere(now),
		...(searchCondition ? [searchCondition] : []),
		...(brandFilters.length > 0 ? [{ brand: { slug: { in: brandFilters } } }] : []),
		...(inStock !== undefined ? [{ inStock }] : []),
		...(dynamicConditions.length > 0 ? dynamicConditions : []),
		...(priceFilter
			? [
					{
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
					},
				]
			: []),
	];

	const whereClause: Prisma.ProductWhereInput = { AND: combinedConditions };

	const [totalCount, distinctCategories] = await prisma.$transaction([
		prisma.product.count({ where: whereClause }),
		prisma.product.findMany({
			where: whereClause,
			distinct: ['categoryId'],
			select: {
				category: {
					select: {
						slug: true,
						name: true,
						translations: {
							where: { locale: { in: localeFallbacks } },
							select: { locale: true, name: true },
							orderBy: { updatedAt: 'desc' },
						},
						parent: {
							select: {
								slug: true,
								name: true,
								translations: {
									where: { locale: { in: localeFallbacks } },
									select: { locale: true, name: true },
									orderBy: { updatedAt: 'desc' },
								},
							},
						},
					},
				},
			},
		}),
	]);

	const uniqueSubcategoriesMap = new Map<
		string,
		{
			categoryName: string;
			categorySlug: string;
			subcategoryName: string;
			subcategorySlug: string;
		}
	>();

	for (const p of distinctCategories) {
		const category = p.category;
		if (!category?.slug) continue;
		const categoryTranslation = pickLocalizedTranslation(category.translations, locale);
		const parentTranslation = pickLocalizedTranslation(category.parent?.translations, locale);
		const subcategorySlug = category.slug;
		if (!uniqueSubcategoriesMap.has(subcategorySlug)) {
			uniqueSubcategoriesMap.set(subcategorySlug, {
				categoryName: parentTranslation?.name ?? category.parent?.name ?? '',
				categorySlug: category.parent?.slug || '',
				subcategoryName: categoryTranslation?.name ?? category.name ?? '',
				subcategorySlug,
			});
		}
	}

	const isEffectivePriceSort = orderBy === 'cheap' || orderBy === 'expensive';
	const orderByClause: Prisma.ProductOrderByWithRelationInput[] =
		orderBy === 'new'
			? [{ inStock: 'desc' }, { createdAt: 'desc' }, { name: 'asc' }]
			: [{ inStock: 'desc' }, { name: 'asc' }];

	const productSelect = {
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
		categoryName: true,
		subcategoryName: true,
		translations: {
			where: { locale: { in: localeFallbacks } },
			select: {
				locale: true,
				name: true,
				categoryName: true,
				subcategoryName: true,
			},
			orderBy: { updatedAt: 'desc' },
		},
		discountPrice: true,
		discountStartAt: true,
		discountEndAt: true,
		inStock: true,
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
		averageRating: true,
		reviewCount: true,
	} satisfies Prisma.ProductSelect;

	type ProductRow = Prisma.ProductGetPayload<{ select: typeof productSelect }>;
	let products: ProductRow[] = [];

	if (isEffectivePriceSort) {
		const candidateRows = await prisma.product.findMany({
			where: whereClause,
			select: {
				id: true,
				name: true,
				inStock: true,
				basePrice: true,
				discountPrice: true,
				discountStartAt: true,
				discountEndAt: true,
				variants: {
					where: { stock: { gt: 0 } },
					orderBy: [{ price: 'asc' }, { createdAt: 'asc' }],
					take: 1,
					select: {
						price: true,
						discountPrice: true,
						discountStartAt: true,
						discountEndAt: true,
					},
				},
			},
		});
		const sortedPageIds = getPaginatedIdsByEffectivePriceSort(
			candidateRows,
			orderBy === 'cheap' ? 'asc' : 'desc',
			safeOffset,
			safeLimit,
			now
		);

		if (sortedPageIds.length > 0) {
			const pageRows = await prisma.product.findMany({
				where: {
					AND: [whereClause, { id: { in: sortedPageIds } }],
				},
				select: productSelect,
			});
			const byId = new Map(pageRows.map((product) => [product.id, product]));
			products = sortedPageIds
				.map((productId) => byId.get(productId))
				.filter((product): product is ProductRow => Boolean(product));
		}
	} else {
		products = await prisma.product.findMany({
			where: whereClause,
			orderBy: orderByClause,
			skip: safeOffset,
			take: safeLimit,
			select: productSelect,
		});
	}

	const productIds = [...new Set(products.map((product) => product.id).filter(Boolean))];
	for (const productId of productIds) {
		cacheTag(productCacheTagById(productId));
	}

	const productItems: SubcategoryProduct[] = products.map((product) => {
		const translation = pickLocalizedTranslation(product.translations, locale);
		const { variants, productImages, translations, ...rest } = product as typeof product & {
			variants?: unknown;
			productImages?: unknown;
			translations?: unknown;
		};

		const productBasePrice = Number(product.basePrice ?? 0);
		const defaultVariant = product.variants?.[0];
		const basePrice = defaultVariant ? defaultVariant.price.toNumber() : productBasePrice;
		const persistedImages = product.productImages.map((image) => image.url);
		const primaryImageUrl = resolveProductPrimaryImageFromGallery(
			product.imageUrl,
			persistedImages
		);
		const images = buildProductImageGallery(product.imageUrl, persistedImages, 4);
		const scheduledDiscountPrice = defaultVariant
			? getEffectiveVariantDiscountPrice({
					variantBasePrice: basePrice,
					variantDiscountPrice: defaultVariant.discountPrice?.toNumber() ?? null,
					variantDiscountStartAt: defaultVariant.discountStartAt ?? null,
					variantDiscountEndAt: defaultVariant.discountEndAt ?? null,
					productBasePrice,
					productDiscountPrice: product.discountPrice != null ? Number(product.discountPrice) : null,
					productDiscountStartAt: product.discountStartAt ?? null,
					productDiscountEndAt: product.discountEndAt ?? null,
					now,
				})
			: getEffectiveDiscountPrice(
					productBasePrice,
					product.discountPrice != null ? Number(product.discountPrice) : null,
					product.discountStartAt ?? null,
					product.discountEndAt ?? null,
					now
				);

		return {
			...rest,
			id: product.id ?? '',
			name: translation?.name ?? product.name ?? '',
			fullSlug: product.fullSlug ?? '',
			imageUrl: primaryImageUrl,
			images,
			categoryName: translation?.categoryName ?? product.categoryName ?? '',
			subcategoryName: translation?.subcategoryName ?? product.subcategoryName ?? '',
			inStock: !!product.inStock,
			basePrice,
			discountPrice: scheduledDiscountPrice,
			defaultVariant: product.variants?.[0]
				? {
						id: product.variants[0].id,
						sku: product.variants[0].sku,
						price: product.variants[0].price.toNumber(),
						discountPrice: getEffectiveVariantDiscountPrice({
							variantBasePrice: product.variants[0].price.toNumber(),
							variantDiscountPrice: product.variants[0].discountPrice?.toNumber() ?? null,
							variantDiscountStartAt: product.variants[0].discountStartAt ?? null,
							variantDiscountEndAt: product.variants[0].discountEndAt ?? null,
							productBasePrice,
							productDiscountPrice:
								product.discountPrice != null ? Number(product.discountPrice) : null,
							productDiscountStartAt: product.discountStartAt ?? null,
							productDiscountEndAt: product.discountEndAt ?? null,
							now,
						}),
						stock: product.variants[0].stock,
						label: product.variants[0].attributes
							.map((a) => {
								const name = a.attribute.name?.trim?.() ?? '';
								const valueWithUnit = [a.value, a.attribute.unit].filter(Boolean).join(' ').trim();
								if (name && valueWithUnit) return `${name}: ${valueWithUnit}`;
								return name || valueWithUnit;
							})
							.join(' / '),
				  }
				: undefined,
			averageRating: Number(product.averageRating ?? 0),
			reviewCount: Number(product.reviewCount ?? 0),
		};
	});

	const maxPriceValue = await getMaxEffectiveProductPrice(whereClause, now);

	return {
		products: productItems,
		totalCount,
		subcategories: Array.from(uniqueSubcategoriesMap.values()),
		maxProductPrice: maxPriceValue,
	};
}
