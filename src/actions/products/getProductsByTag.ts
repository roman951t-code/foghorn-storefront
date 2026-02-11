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
import { buildProductImages } from '@/utils/productImages';
import { PRODUCT_LIST_CACHE_TAG } from '@/constants/products';
import { getEffectiveDiscountPrice } from '@/utils/discountSchedule';
import { getLocaleFallbacks, pickLocalizedTranslation } from '@/utils/localeFallback';
import { getPublishedProductWhere } from '@/utils/publishSchedule';

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
			some: {
				attribute: { name: key },
				value: { in: values.flat() },
			},
		},
	}));

	const whereClause: Prisma.ProductWhereInput = {
		tags: { has: tag },
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

	const productsQuery = await prisma.product.findMany({
		where: whereClause,
		orderBy: orderByClause,
		skip: safeOffset,
		take: safeLimit,
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
			reviews: { select: { rating: true } },
			createdAt: true,
		},
	});

	const productsWithPrice = productsQuery.map((p) => {
		const basePrice = Number(p.basePrice ?? 0);
		const discountPrice = getEffectiveDiscountPrice(
			basePrice,
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
		const { variants, reviews, productImages, translations, ...rest } = product as typeof product & {
			variants?: unknown;
			reviews?: unknown;
			productImages?: unknown;
			translations?: unknown;
		};
		const ratings = product.reviews?.map((r) => r.rating) ?? [];
		const averageRating = ratings.length
			? ratings.reduce((sum, val) => sum + val, 0) / ratings.length
			: 0;

		return {
			...rest,
			id: product.id ?? '',
			name: translation?.name ?? product.name ?? '',
			fullSlug: product.fullSlug ?? '',
			imageUrl: product.imageUrl ?? null,
			images: product.productImages.length
				? product.productImages.map((image) => image.url)
				: buildProductImages(product.imageUrl ?? undefined, 4),
			inStock: !!product.inStock,
			basePrice: Number(product.basePrice ?? 0),
			discountPrice: product.discountPrice != null ? Number(product.discountPrice) : null,
			defaultVariant: product.variants?.[0]
				? {
						id: product.variants[0].id,
						sku: product.variants[0].sku,
						price: product.variants[0].price.toNumber(),
						stock: product.variants[0].stock,
						label: product.variants[0].attributes
							.map((a) =>
								[a.attribute.name, a.value, a.attribute.unit].filter(Boolean).join(' ')
							)
							.join(' / '),
					}
				: undefined,
			averageRating,
			reviewCount: product.reviews?.length ?? 0,
		} as SubcategoryProduct;
	});

	const maxProductPrice = products.reduce(
		(max, p) => Math.max(max, p.discountPrice ?? p.basePrice ?? 0),
		0
	);

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
