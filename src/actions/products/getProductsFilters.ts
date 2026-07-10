'use server';

import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';
import { Prisma } from '@prisma/client';
import { DEFAULT_LOCALE } from '@/constants/locales';
import { prisma } from '@/lib/prisma';
import { PRODUCT_FILTERS_CACHE_TAG, PRODUCT_LIST_CACHE_TAG } from '@/constants/products';
import type { Filter } from '@/types/product';
import { getLocaleFallbacks } from '@/utils/localeFallback';
import { sortByAttributeSet } from '@/utils/attributeSetOrder';
import { getPublishedProductWhere } from '@/utils/publishSchedule';

const isNumericString = (value: string) => /^-?\d+(\.\d+)?$/.test(value.trim());

const sortValues = (values: string[]) => {
	if (values.length === 0) return values;
	const allNumeric = values.every((v) => isNumericString(v) && Number.isFinite(Number(v)));
	if (allNumeric) {
		return [...values].sort((a, b) => Number(a) - Number(b));
	}
	return [...values].sort((a, b) => a.localeCompare(b));
};

const buildFilterValues = (values: string[]) => {
	const uniqueValues = [...new Set(values)].filter((v) => v !== null && v !== undefined && v !== '');
	const sorted = sortValues(uniqueValues);
	return sorted.map((value) => ({
		value,
		label: value,
	}));
};

export async function getSubcategoryFilters(subcategorySlug: string) {
	'use cache';
	cacheLife('hours');
	cacheTag(PRODUCT_FILTERS_CACHE_TAG, PRODUCT_LIST_CACHE_TAG);
	const now = new Date();
	const publishedWhere = getPublishedProductWhere(now);

	const subcategory = await prisma.productCategory.findUnique({
		where: { slug: subcategorySlug },
		select: {
			id: true,
			attributeSet: {
				select: {
					items: {
						select: { attributeId: true, sortOrder: true },
						orderBy: [{ sortOrder: 'asc' }, { attributeId: 'asc' }],
					},
				},
			},
		},
	});

	if (!subcategory) return null;

	const attributeSetItems = subcategory.attributeSet?.items ?? [];
	const attributeIdsInSet = attributeSetItems.map((i) => i.attributeId).filter(Boolean);

	const attributes = await prisma.productAttribute.findMany({
		where: {
			...(attributeIdsInSet.length > 0 ? { id: { in: attributeIdsInSet } } : {}),
			products: {
				some: {
					product: {
						AND: [{ categoryId: subcategory.id }, publishedWhere],
					},
				},
			},
		},
		select: {
			id: true,
			name: true,
			unit: true,
			products: {
				where: {
					product: {
						AND: [{ categoryId: subcategory.id }, publishedWhere],
					},
				},
				select: { value: true },
			},
		},
	});

	const brands = await prisma.brand.findMany({
		where: {
			products: {
				some: {
					AND: [{ categoryId: subcategory.id }, publishedWhere],
				},
			},
		},
		select: { id: true, name: true, slug: true },
		orderBy: { name: 'asc' },
	});

	const attributeFiltersUnsorted: Filter[] = attributes
		.map((attr) => {
			return {
				id: attr.id,
				// Stable and unique, unlike a name-derived slug — see the other
				// two key: attr.id sites in this file for why.
				key: attr.id,
				name: attr.name,
				unit: attr.unit,
				values: buildFilterValues(attr.products.map((p) => p.value)),
			};
		})
		.filter((attr) => attr.values.length > 0);

	const attributeFilters = sortByAttributeSet(attributeFiltersUnsorted, attributeSetItems);

	const brandFilter: Filter | null =
		brands.length > 0
			? {
					id: 'brand',
					key: 'brand',
					name: 'Brand',
					unit: null,
					values: brands.map((brand) => ({ value: brand.slug, label: brand.name })),
				}
			: null;

	return [brandFilter, ...attributeFilters].filter(Boolean) as Filter[];
}

export async function getTagFilters(tag: string) {
	'use cache';
	cacheLife('hours');
	cacheTag(PRODUCT_FILTERS_CACHE_TAG, PRODUCT_LIST_CACHE_TAG);
	const now = new Date();
	const publishedWhere = getPublishedProductWhere(now);

	const brands = await prisma.brand.findMany({
		where: {
			products: {
				some: {
					AND: [{ tags: { has: tag } }, publishedWhere],
				},
			},
		},
		select: { id: true, name: true, slug: true },
		orderBy: { name: 'asc' },
	});

	const attributes = await prisma.productAttribute.findMany({
		select: {
			id: true,
			name: true,
			unit: true,
			products: {
				where: {
					product: {
						AND: [{ tags: { has: tag } }, publishedWhere],
					},
				},
				select: { value: true },
			},
		},
	});

	const attributeFilters: Filter[] = attributes
		.map((attr) => {
			return {
				id: attr.id,
				// Stable and unique, unlike a name-derived slug (see
				// getSubcategoryFilters above for why this changed).
				key: attr.id,
				name: attr.name,
				unit: attr.unit,
				values: buildFilterValues(attr.products.map((p) => p.value)),
			};
		})
		.filter((attr) => attr.values.length > 0);

	const brandFilter: Filter | null =
		brands.length > 0
			? {
					id: 'brand',
					key: 'brand',
					name: 'Brand',
					unit: null,
					values: brands.map((brand) => ({ value: brand.slug, label: brand.name })),
				}
			: null;

	return [brandFilter, ...attributeFilters].filter(Boolean) as Filter[];
}

export async function getSearchFilters(
	searchQuery: string,
	locale: string = DEFAULT_LOCALE
) {
	'use cache';
	cacheLife('hours');
	cacheTag(PRODUCT_FILTERS_CACHE_TAG, PRODUCT_LIST_CACHE_TAG);
	const now = new Date();
	const publishedWhere = getPublishedProductWhere(now);

	const localeFallbacks = getLocaleFallbacks(locale);
	const normalizedSearchQuery = searchQuery.trim();
	const searchCondition: Prisma.ProductWhereInput =
		normalizedSearchQuery.length > 0
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
			: {};

	const brands = await prisma.brand.findMany({
		where: {
			products: {
				some: {
					AND: [searchCondition, publishedWhere],
				},
			},
		},
		select: { id: true, name: true, slug: true },
		orderBy: { name: 'asc' },
	});

	const attributes = await prisma.productAttribute.findMany({
		select: {
			id: true,
			name: true,
			unit: true,
			products: {
				where: {
					product: {
						AND: [searchCondition, publishedWhere],
					},
				},
				select: { value: true },
			},
		},
	});

	const attributeFilters: Filter[] = attributes
		.map((attr) => {
			return {
				id: attr.id,
				// Stable and unique, unlike a name-derived slug (see
				// getSubcategoryFilters above for why this changed).
				key: attr.id,
				name: attr.name,
				unit: attr.unit,
				values: buildFilterValues(attr.products.map((p) => p.value)),
			};
		})
		.filter((attr) => attr.values.length > 0);

	const brandFilter: Filter | null =
		brands.length > 0
			? {
					id: 'brand',
					key: 'brand',
					name: 'Brand',
					unit: null,
					values: brands.map((brand) => ({ value: brand.slug, label: brand.name })),
				}
			: null;

	return [brandFilter, ...attributeFilters].filter(Boolean) as Filter[];
}
