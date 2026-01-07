'use server';

import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { PRODUCT_FILTERS_CACHE_TAG, PRODUCT_LIST_CACHE_TAG } from '@/constants/products';

export async function getSubcategoryFilters(subcategorySlug: string) {
	'use cache';
	cacheLife('hours');
	cacheTag(PRODUCT_FILTERS_CACHE_TAG, PRODUCT_LIST_CACHE_TAG);

	const subcategory = await prisma.productCategory.findUnique({
		where: { slug: subcategorySlug },
		select: { id: true },
	});

	if (!subcategory) return null;

	const attributes = await prisma.productAttribute.findMany({
		select: {
			id: true,
			name: true,
			products: {
				where: {
					product: { categoryId: subcategory.id },
				},
				select: { value: true },
			},
		},
	});

	return attributes
		.map((attr) => {
			const uniqueValues = [...new Set(attr.products.map((p) => p.value))];
			return {
				id: attr.id,
				name: attr.name,
				values: uniqueValues,
			};
		})
		.filter((attr) => attr.values.length > 0);
}

export async function getTagFilters(tag: string) {
	'use cache';
	cacheLife('hours');
	cacheTag(PRODUCT_FILTERS_CACHE_TAG, PRODUCT_LIST_CACHE_TAG);

	const attributes = await prisma.productAttribute.findMany({
		select: {
			id: true,
			name: true,
			products: {
				where: { product: { tags: { has: tag } } },
				select: { value: true },
			},
		},
	});

	return attributes
		.map((attr) => {
			const uniqueValues = [...new Set(attr.products.map((p) => p.value))];
			return {
				id: attr.id,
				name: attr.name,
				values: uniqueValues,
			};
		})
		.filter((attr) => attr.values.length > 0);
}

export async function getSearchFilters(searchQuery: string) {
	'use cache';
	cacheLife('hours');
	cacheTag(PRODUCT_FILTERS_CACHE_TAG, PRODUCT_LIST_CACHE_TAG);

	const attributes = await prisma.productAttribute.findMany({
		select: {
			id: true,
			name: true,
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

	return attributes
		.map((attr) => {
			const uniqueValues = [...new Set(attr.products.map((p) => p.value))];
			return {
				id: attr.id,
				name: attr.name,
				values: uniqueValues,
			};
		})
		.filter((attr) => attr.values.length > 0);
}
