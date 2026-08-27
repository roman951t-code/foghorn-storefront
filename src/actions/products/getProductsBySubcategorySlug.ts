'use server';

import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';
import { DEFAULT_LOCALE } from '@/constants/locales';
import { prisma } from '@/lib/prisma';
import { SubcategoryProduct } from '@/types/product';
import { Prisma } from '@prisma/client';
import { MAX_PRODUCTS_PER_PAGE } from '@/constants/pagination';
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
import { getDefaultSortedProductPageIds } from '@/utils/defaultProductSort';
import { buildLocalizedVariantLabel } from '@/utils/attributeLocalization';
import {
	PRODUCT_CATEGORY_CACHE_TAG,
	PRODUCT_LIST_CACHE_TAG,
	productCacheTagById,
} from '@/constants/products';

export async function getProductsBySubcategorySlug(
	slug: string,
	limit = 12,
	offset = 0,
	onlyInStock?: boolean,
	inStock?: boolean,
	minPrice?: number,
	maxPrice?: number,
	orderBy?: 'new' | 'expensive' | 'cheap',
	filters?: Record<string, string[]>,
	locale: string = DEFAULT_LOCALE
) {
	'use cache';
	cacheLife('hours');
	cacheTag(PRODUCT_LIST_CACHE_TAG, PRODUCT_CATEGORY_CACHE_TAG);

	const safeLimit = Math.min(MAX_PRODUCTS_PER_PAGE, Math.max(1, Math.floor(limit || 1)));
	const safeOffset = Math.max(0, Math.floor(offset || 0));

	const localeFallbacks = getLocaleFallbacks(locale);
	const subcategory = await prisma.productCategory.findUnique({
		where: { slug },
		select: {
			name: true,
			translations: {
				where: { locale: { in: localeFallbacks } },
				select: { locale: true, name: true },
				orderBy: { updatedAt: 'desc' },
			},
			parent: {
				select: {
					name: true,
					translations: {
						where: { locale: { in: localeFallbacks } },
						select: { locale: true, name: true },
						orderBy: { updatedAt: 'desc' },
					},
				},
			},
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

	const brandFilters = (filters?.brand ?? []).flat().filter(Boolean);
	const attributeFilters = filters
		? Object.entries(filters).filter(([key]) => key !== 'brand')
		: [];

	const dynamicConditions = attributeFilters.map(([key, values]) => ({
		attributes: {
			some: {
				// key is the attribute's id (see getProductsFilters.ts) — matching
				// on it directly instead of a localized name guess is the fix for
				// the empty-results bug (real attribute names like "Памʼять" or
				// abbreviated ones like "ОЗП" never matched the guessed candidates).
				attributeId: key,
				value: { in: values.flat() },
			},
		},
	}));

	const whereClause: Prisma.ProductWhereInput = {
		category: { slug },
		...(brandFilters.length > 0 ? { brand: { slug: { in: brandFilters } } } : {}),
		// onlyInStock is a caller-forced mode (e.g. the "similar products"
		// fallback), not a user-toggleable filter — it must win over an
		// explicit `inStock` param, not be silently overridden by it.
		...(inStock !== undefined ? { inStock } : {}),
		...(onlyInStock ? { inStock: true } : {}),
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

	const isEffectivePriceSort = orderBy === 'cheap' || orderBy === 'expensive';
	const orderByClause: Prisma.ProductOrderByWithRelationInput[] =
		orderBy === 'new'
			? [{ inStock: 'desc' }, { createdAt: 'desc' }, { name: 'asc' }]
			: [{ inStock: 'desc' }, { name: 'asc' }];

	const fetchProducts = (args: Omit<Prisma.ProductFindManyArgs, 'select'>) =>
		prisma.product.findMany({
			...args,
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
				tags: true,
			},
		});

	const getPaginatedProducts = async (): Promise<Awaited<ReturnType<typeof fetchProducts>>> => {
		if (!orderBy) {
			const pageIds = await getDefaultSortedProductPageIds({
				whereClause,
				limit: safeLimit,
				offset: safeOffset,
			});

			if (pageIds.length === 0) return [];

			const pageProducts = await fetchProducts({
				where: {
					AND: [whereClause, { id: { in: pageIds } }],
				},
			});
			const productById = new Map(pageProducts.map((product) => [product.id, product]));
			return pageIds
				.map((productId) => productById.get(productId))
				.filter((product): product is (typeof pageProducts)[number] => Boolean(product));
		}

		if (isEffectivePriceSort) {
			// Sorted directly by the materialized Product.sortPrice column
			// (kept in sync by src/utils/productEffectivePrice.ts callers) —
			// no more pulling every matching row into application code just to
			// resolve each one's discount window before sorting/paginating.
			return fetchProducts({
				where: whereClause,
				orderBy: [
					{ inStock: 'desc' },
					{ sortPrice: orderBy === 'cheap' ? 'asc' : 'desc' },
					{ name: 'asc' },
				],
				skip: safeOffset,
				take: safeLimit,
			});
		}

		return fetchProducts({
			where: whereClause,
			orderBy: orderByClause,
			skip: safeOffset,
			take: safeLimit,
		});
	};

	// totalCount / paginated products / max price are mutually independent
	// (all derive from whereClause alone) so they run concurrently instead of
	// serially — this halves the number of sequential round trips per request.
	const [totalCount, paginatedProducts, maxPriceAggregate] = await Promise.all([
		prisma.product.count({ where: whereClause }),
		getPaginatedProducts(),
		prisma.product.aggregate({ where: whereClause, _max: { sortPrice: true } }),
	]);
	const maxProductPrice = maxPriceAggregate._max.sortPrice?.toNumber() ?? 0;

	const productIds = [...new Set(paginatedProducts.map((product) => product.id).filter(Boolean))];
	for (const productId of productIds) {
		cacheTag(productCacheTagById(productId));
	}

	const products: SubcategoryProduct[] = paginatedProducts.map((p) => {
		const translation = pickLocalizedTranslation(p.translations, locale);
		const { variants, tags, productImages, translations, ...rest } = p as typeof p & {
			variants?: unknown;
			tags?: unknown;
			productImages?: unknown;
			translations?: unknown;
		};

		const productBasePrice = Number(p.basePrice ?? 0);
		const defaultVariant = p.variants?.[0];
		const basePrice = defaultVariant ? defaultVariant.price.toNumber() : productBasePrice;
		const persistedImages = p.productImages.map((image) => image.url);
		const primaryImageUrl = resolveProductPrimaryImageFromGallery(p.imageUrl, persistedImages);
		const images = buildProductImageGallery(p.imageUrl, persistedImages, 4);
		const scheduledDiscountPrice = defaultVariant
			? getEffectiveVariantDiscountPrice({
					variantBasePrice: basePrice,
					variantDiscountPrice: defaultVariant.discountPrice?.toNumber() ?? null,
					variantDiscountStartAt: defaultVariant.discountStartAt ?? null,
					variantDiscountEndAt: defaultVariant.discountEndAt ?? null,
					productBasePrice,
					productDiscountPrice: p.discountPrice != null ? Number(p.discountPrice) : null,
					productDiscountStartAt: p.discountStartAt ?? null,
					productDiscountEndAt: p.discountEndAt ?? null,
					now,
				})
			: getEffectiveDiscountPrice(
					productBasePrice,
					p.discountPrice != null ? Number(p.discountPrice) : null,
					p.discountStartAt ?? null,
					p.discountEndAt ?? null,
					now
				);

		return {
			...rest,
			id: p.id ?? '',
			name: translation?.name ?? p.name ?? '',
			fullSlug: p.fullSlug ?? '',
			imageUrl: primaryImageUrl,
			images,
			categoryName: translation?.categoryName ?? p.categoryName ?? '',
			subcategoryName: translation?.subcategoryName ?? p.subcategoryName ?? '',
			inStock: !!p.inStock,
			basePrice,
			discountPrice: scheduledDiscountPrice,
			defaultVariant: p.variants?.[0]
				? {
						id: p.variants[0].id,
						sku: p.variants[0].sku,
						price: p.variants[0].price.toNumber(),
						discountPrice: getEffectiveVariantDiscountPrice({
							variantBasePrice: p.variants[0].price.toNumber(),
							variantDiscountPrice: p.variants[0].discountPrice?.toNumber() ?? null,
							variantDiscountStartAt: p.variants[0].discountStartAt ?? null,
							variantDiscountEndAt: p.variants[0].discountEndAt ?? null,
							productBasePrice,
							productDiscountPrice: p.discountPrice != null ? Number(p.discountPrice) : null,
							productDiscountStartAt: p.discountStartAt ?? null,
							productDiscountEndAt: p.discountEndAt ?? null,
							now,
						}),
						stock: p.variants[0].stock,
						label:
							buildLocalizedVariantLabel(
								p.variants[0].attributes.map((a) => ({
									name: a.attribute.name,
									value: a.value,
									unit: a.attribute.unit,
								})),
								locale
							) ?? '',
				  }
				: undefined,
			averageRating: Number(p.averageRating ?? 0),
			reviewCount: Number(p.reviewCount ?? 0),
			tags: p.tags ?? [],
		} as SubcategoryProduct;
	});

	const subcategoryTranslation = pickLocalizedTranslation(subcategory.translations, locale);
	const parentTranslation = pickLocalizedTranslation(subcategory.parent?.translations, locale);

	return {
		categoryName: parentTranslation?.name ?? subcategory.parent?.name ?? '',
		subcategoryName: subcategoryTranslation?.name ?? subcategory.name,
		products,
		totalCount,
		maxProductPrice,
	};
}
