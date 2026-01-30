'use server';

import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { PRODUCT_FILTERS_CACHE_TAG, PRODUCT_LIST_CACHE_TAG } from '@/constants/products';
import type { Filter } from '@/types/product';
import { sortByAttributeSet } from '@/utils/attributeSetOrder';

const isNumericString = (value: string) => /^-?\d+(\.\d+)?$/.test(value.trim());

const sortValues = (values: string[]) => {
	if (values.length === 0) return values;
	const allNumeric = values.every((v) => isNumericString(v) && Number.isFinite(Number(v)));
	if (allNumeric) {
		return [...values].sort((a, b) => Number(a) - Number(b));
	}
	return [...values].sort((a, b) => a.localeCompare(b));
};

const buildFilterValues = (values: string[], unit?: string | null) => {
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
			products: { some: { product: { categoryId: subcategory.id } } },
		},
		select: {
			id: true,
			name: true,
			unit: true,
			products: {
				where: {
					product: { categoryId: subcategory.id },
				},
				select: { value: true },
			},
		},
	});

	const brands = await prisma.brand.findMany({
		where: {
			products: {
				some: {
					categoryId: subcategory.id,
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
				key: attr.name,
				name: attr.name,
				unit: attr.unit,
				values: buildFilterValues(attr.products.map((p) => p.value), attr.unit),
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

	const brands = await prisma.brand.findMany({
		where: {
			products: {
				some: {
					tags: { has: tag },
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
				where: { product: { tags: { has: tag } } },
				select: { value: true },
			},
		},
	});

	const attributeFilters: Filter[] = attributes
		.map((attr) => {
			return {
				id: attr.id,
				key: attr.name,
				name: attr.name,
				unit: attr.unit,
				values: buildFilterValues(attr.products.map((p) => p.value), attr.unit),
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

export async function getSearchFilters(searchQuery: string) {
	'use cache';
	cacheLife('hours');
	cacheTag(PRODUCT_FILTERS_CACHE_TAG, PRODUCT_LIST_CACHE_TAG);

	const brands = await prisma.brand.findMany({
		where: {
			products: {
				some: {
					name: { contains: searchQuery, mode: 'insensitive' },
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
						name: { contains: searchQuery, mode: 'insensitive' },
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
				key: attr.name,
				name: attr.name,
				unit: attr.unit,
				values: buildFilterValues(attr.products.map((p) => p.value), attr.unit),
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
