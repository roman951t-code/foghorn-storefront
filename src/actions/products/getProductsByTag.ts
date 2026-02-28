'use server';
import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';
import { DEFAULT_LOCALE } from '@/constants/locales';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import {
	ProductsOnly,
	ProductsWithMeta,
	SubcategoryInfo,
	SubcategoryProduct,
} from '@/types/product';
import {
	buildProductImageGallery,
	resolveProductPrimaryImageFromGallery,
} from '@/utils/productImages';
import { PRODUCT_LIST_CACHE_TAG, productCacheTagById } from '@/constants/products';
import {
	getEffectiveDiscountPrice,
	getEffectiveVariantDiscountPrice,
} from '@/utils/discountSchedule';
import { getPaginatedIdsByEffectivePriceSort } from '@/utils/effectivePriceSorting';
import { getLocaleFallbacks, pickLocalizedTranslation } from '@/utils/localeFallback';
import { getPublishedProductWhere } from '@/utils/publishSchedule';
import { MAX_PRODUCTS_PER_PAGE } from '@/constants/pagination';
import { getMaxEffectiveProductPrice } from '@/utils/maxEffectiveProductPrice';
import { getAttributeNameCandidatesForFilterKey } from '@/utils/attributeLocalization';

export async function getProductsByTag<T extends boolean>(
	tag: string,
	fetchAll: T = false as T,
	limit = 12,
	offset = 0,
	minPrice?: number,
	maxPrice?: number,
	inStock?: boolean,
	orderBy?: 'new' | 'expensive' | 'cheap',
	filters?: Record<string, string[]>,
	locale: string = DEFAULT_LOCALE
): Promise<T extends true ? ProductsWithMeta : ProductsOnly> {
	'use cache';
	cacheLife('hours');
	cacheTag(PRODUCT_LIST_CACHE_TAG);

	const localeFallbacks = getLocaleFallbacks(locale);
	const safeLimit = Math.min(MAX_PRODUCTS_PER_PAGE, Math.max(1, Math.floor(limit || 1)));
	const safeOffset = Math.max(0, Math.floor(offset || 0));
	const now = new Date();
	const isDiscountTag = tag === 'discount';

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

	const activeDiscountCondition: Prisma.ProductWhereInput = {
		discountPrice: { not: null },
		OR: [
			{ discountStartAt: null, discountEndAt: null },
			{ discountStartAt: { lte: now }, discountEndAt: { gt: now } },
		],
	};
	const activeVariantDiscountCondition: Prisma.ProductWhereInput = {
		variants: {
			some: {
				discountPrice: { not: null },
				OR: [
					{ discountStartAt: null, discountEndAt: null },
					{ discountStartAt: { lte: now }, discountEndAt: { gt: now } },
				],
			},
		},
	};

	const whereClause: Prisma.ProductWhereInput = {
		...(isDiscountTag
			? {
					OR: [{ tags: { has: tag } }, activeDiscountCondition, activeVariantDiscountCondition],
				}
			: { tags: { has: tag } }),
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
		discountPrice: true,
		discountStartAt: true,
		discountEndAt: true,
		inStock: true,
		translations: {
			where: { locale: { in: localeFallbacks } },
			select: { locale: true, name: true },
			orderBy: { updatedAt: 'desc' },
		},
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
		createdAt: true,
	} satisfies Prisma.ProductSelect;

	type ProductRow = Prisma.ProductGetPayload<{ select: typeof productSelect }>;
	const fetchProducts = (args: Omit<Prisma.ProductFindManyArgs, 'select'>) =>
		prisma.product.findMany({
			...args,
			select: productSelect,
		});

	const [productsQuery, maxProductPrice] = await Promise.all([
		(async (): Promise<ProductRow[]> => {
			if (!isEffectivePriceSort) {
				return fetchProducts({
					where: whereClause,
					orderBy: orderByClause,
					skip: safeOffset,
					take: safeLimit,
				});
			}

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

			if (sortedPageIds.length === 0) return [];

			const pageRows = await fetchProducts({
				where: {
					AND: [whereClause, { id: { in: sortedPageIds } }],
				},
			});
			const byId = new Map(pageRows.map((product) => [product.id, product]));
			return sortedPageIds
				.map((productId) => byId.get(productId))
				.filter((product): product is ProductRow => Boolean(product));
		})(),
		getMaxEffectiveProductPrice(whereClause, now),
	]);

	const productIds = [...new Set(productsQuery.map((product) => product.id).filter(Boolean))];
	for (const productId of productIds) {
		cacheTag(productCacheTagById(productId));
	}

	const productsWithPrice = productsQuery.map((p) => {
		const productBasePrice = Number(p.basePrice ?? 0);
		const defaultVariant = p.variants?.[0];
		const basePrice = defaultVariant ? defaultVariant.price.toNumber() : productBasePrice;
		const discountPrice = defaultVariant
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
			...p,
			basePrice,
			discountPrice,
			effectivePrice: Number(discountPrice ?? basePrice ?? 0),
		};
	});

	const products: SubcategoryProduct[] = productsWithPrice.map((product) => {
		const translation = pickLocalizedTranslation(product.translations, locale);
		const { variants, productImages, translations, ...rest } = product as typeof product & {
			variants?: unknown;
			productImages?: unknown;
			translations?: unknown;
		};
		const persistedImages = product.productImages.map((image) => image.url);
		const primaryImageUrl = resolveProductPrimaryImageFromGallery(
			product.imageUrl,
			persistedImages
		);
		const images = buildProductImageGallery(product.imageUrl, persistedImages, 4);

		return {
			...rest,
			id: product.id ?? '',
			name: translation?.name ?? product.name ?? '',
			fullSlug: product.fullSlug ?? '',
			imageUrl: primaryImageUrl,
			images,
			inStock: !!product.inStock,
			basePrice: Number(product.basePrice ?? 0),
			discountPrice: product.discountPrice != null ? Number(product.discountPrice) : null,
			defaultVariant: product.variants?.[0]
				? {
						id: product.variants[0].id,
						sku: product.variants[0].sku,
						price: product.variants[0].price.toNumber(),
						discountPrice: product.discountPrice != null ? Number(product.discountPrice) : null,
						stock: product.variants[0].stock,
						label: product.variants[0].attributes
							.map((a) =>
								[a.attribute.name, a.value, a.attribute.unit].filter(Boolean).join(' ')
							)
							.join(' / '),
				  }
				: undefined,
			averageRating: Number(product.averageRating ?? 0),
			reviewCount: Number(product.reviewCount ?? 0),
		} as SubcategoryProduct;
	});

	if (!fetchAll) {
		return { products, maxProductPrice } as T extends true ? ProductsWithMeta : ProductsOnly;
	}

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

	const subcategoriesMap = new Map<string, SubcategoryInfo>();
	for (const p of distinctCategories) {
		const category = p.category;
		if (!category?.slug) continue;
		const categoryTranslation = pickLocalizedTranslation(category.translations, locale);
		const parentTranslation = pickLocalizedTranslation(category.parent?.translations, locale);
		const subcategorySlug = category.slug;
		if (!subcategoriesMap.has(subcategorySlug)) {
			subcategoriesMap.set(subcategorySlug, {
				categoryName: parentTranslation?.name ?? category.parent?.name ?? '',
				categorySlug: category.parent?.slug || '',
				subcategoryName: categoryTranslation?.name ?? category.name ?? '',
				subcategorySlug,
			});
		}
	}

	return {
		products,
		totalCount,
		subcategories: Array.from(subcategoriesMap.values()),
		maxProductPrice,
	} as T extends true ? ProductsWithMeta : ProductsOnly;
}
