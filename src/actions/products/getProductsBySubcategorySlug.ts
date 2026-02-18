'use server';

import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';
import { DEFAULT_LOCALE } from '@/constants/locales';
import { prisma } from '@/lib/prisma';
import { SubcategoryProduct } from '@/types/product';
import { Prisma } from '@prisma/client';
import { MAX_PRODUCTS_PER_PAGE } from '@/constants/pagination';
import { buildProductImages } from '@/utils/productImages';
import { getEffectiveDiscountPrice } from '@/utils/discountSchedule';
import { getPaginatedIdsByEffectivePriceSort } from '@/utils/effectivePriceSorting';
import { getLocaleFallbacks, pickLocalizedTranslation } from '@/utils/localeFallback';
import { getPublishedProductWhere } from '@/utils/publishSchedule';
import { getMaxEffectiveProductPrice } from '@/utils/maxEffectiveProductPrice';
import {
	PRODUCT_CATEGORY_CACHE_TAG,
	PRODUCT_LIST_CACHE_TAG,
	productCacheTagById,
} from '@/constants/products';

const DEFAULT_TAG_PRIORITY = ['popular', 'new', 'discount', 'promotional'] as const;

const buildTagPriorityBuckets = (): Prisma.ProductWhereInput[] => {
	const hasTag = (tag: string): Prisma.ProductWhereInput => ({ tags: { has: tag } });
	const [popularTag, newTag, discountTag, promotionalTag] = DEFAULT_TAG_PRIORITY;

	return [
		hasTag(popularTag),
		{ AND: [hasTag(newTag), { NOT: hasTag(popularTag) }] },
		{
			AND: [
				hasTag(discountTag),
				{
					NOT: {
						OR: [hasTag(popularTag), hasTag(newTag)],
					},
				},
			],
		},
		{
			AND: [
				hasTag(promotionalTag),
				{
					NOT: {
						OR: [hasTag(popularTag), hasTag(newTag), hasTag(discountTag)],
					},
				},
			],
		},
		{
			NOT: {
				OR: DEFAULT_TAG_PRIORITY.map((tag) => hasTag(tag)),
			},
		},
	];
};

async function getDefaultSortedProductPageIds({
	whereClause,
	limit,
	offset,
}: {
	whereClause: Prisma.ProductWhereInput;
	limit: number;
	offset: number;
}): Promise<string[]> {
	if (limit <= 0) return [];

	const priorityBuckets = buildTagPriorityBuckets();
	const bucketCounts = await Promise.all(
		priorityBuckets.map((bucketWhere) =>
			prisma.product.count({
				where: {
					AND: [whereClause, bucketWhere],
				},
			})
		)
	);

	let remainingOffset = offset;
	let remainingTake = limit;
	const pageIds: string[] = [];

	for (let bucketIndex = 0; bucketIndex < priorityBuckets.length && remainingTake > 0; bucketIndex += 1) {
		const bucketCount = bucketCounts[bucketIndex] ?? 0;
		if (bucketCount <= 0) continue;

		if (remainingOffset >= bucketCount) {
			remainingOffset -= bucketCount;
			continue;
		}

		const skipInBucket = remainingOffset;
		const takeInBucket = Math.min(remainingTake, bucketCount - skipInBucket);
		if (takeInBucket <= 0) {
			remainingOffset = 0;
			continue;
		}

		const idsInBucket = await prisma.product.findMany({
			where: {
				AND: [whereClause, priorityBuckets[bucketIndex]],
			},
			orderBy: [{ inStock: 'desc' }, { name: 'asc' }],
			skip: skipInBucket,
			take: takeInBucket,
			select: { id: true },
		});

		pageIds.push(...idsInBucket.map((product) => product.id));
		remainingTake -= takeInBucket;
		remainingOffset = 0;
	}

	return pageIds;
}

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
				attribute: { name: key },
				value: { in: values.flat() },
			},
		},
	}));

	const whereClause: Prisma.ProductWhereInput = {
		category: { slug },
		...(brandFilters.length > 0 ? { brand: { slug: { in: brandFilters } } } : {}),
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
		AND: [getPublishedProductWhere(now), ...(dynamicConditions.length > 0 ? dynamicConditions : [])],
	};

	const isEffectivePriceSort = orderBy === 'cheap' || orderBy === 'expensive';
	const orderByClause: Prisma.ProductOrderByWithRelationInput[] =
		orderBy === 'new' ? [{ createdAt: 'desc' }] : [{ inStock: 'desc' }, { name: 'asc' }];

	const totalCount = await prisma.product.count({ where: whereClause });

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

	let paginatedProducts: Awaited<ReturnType<typeof fetchProducts>> = [];
	if (!orderBy) {
		const pageIds = await getDefaultSortedProductPageIds({
			whereClause,
			limit: safeLimit,
			offset: safeOffset,
		});

		if (pageIds.length === 0) {
			paginatedProducts = [];
		} else {
			const pageProducts = await fetchProducts({
				where: {
					AND: [whereClause, { id: { in: pageIds } }],
				},
			});
			const productById = new Map(pageProducts.map((product) => [product.id, product]));
			paginatedProducts = pageIds
				.map((productId) => productById.get(productId))
				.filter((product): product is (typeof pageProducts)[number] => Boolean(product));
		}
	} else if (isEffectivePriceSort) {
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
			},
		});
		const sortedPageIds = getPaginatedIdsByEffectivePriceSort(
			candidateRows,
			orderBy === 'cheap' ? 'asc' : 'desc',
			safeOffset,
			safeLimit,
			now
		);

		if (sortedPageIds.length === 0) {
			paginatedProducts = [];
		} else {
			const pageProducts = await fetchProducts({
				where: {
					AND: [whereClause, { id: { in: sortedPageIds } }],
				},
			});
			const productById = new Map(pageProducts.map((product) => [product.id, product]));
			paginatedProducts = sortedPageIds
				.map((productId) => productById.get(productId))
				.filter((product): product is (typeof pageProducts)[number] => Boolean(product));
		}
	} else {
		paginatedProducts = await fetchProducts({
			where: whereClause,
			orderBy: orderByClause,
			skip: safeOffset,
			take: safeLimit,
		});
	}

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

		const basePrice = Number(p.basePrice ?? 0);
		const scheduledDiscountPrice = getEffectiveDiscountPrice(
			basePrice,
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
			imageUrl: p.imageUrl ?? null,
			images: p.productImages.length
				? p.productImages.map((image) => image.url)
				: buildProductImages(p.imageUrl ?? undefined, 4),
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
						stock: p.variants[0].stock,
						label: p.variants[0].attributes
							.map((a) =>
								[a.attribute.name, a.value, a.attribute.unit].filter(Boolean).join(' ')
							)
							.join(' / '),
						}
					: undefined,
			averageRating: Number(p.averageRating ?? 0),
			reviewCount: Number(p.reviewCount ?? 0),
			tags: p.tags ?? [],
		} as SubcategoryProduct;
	});

	const maxProductPrice = await getMaxEffectiveProductPrice(whereClause, now);

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
