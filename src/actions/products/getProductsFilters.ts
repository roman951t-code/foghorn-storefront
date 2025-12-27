'use server';

import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

type PrismaClientLike = typeof prisma;
type CacheFn = typeof unstable_cache;

function buildFilterFetchers(cache: CacheFn, db: PrismaClientLike) {
	const fetchSubcategoryFilters = async (subcategorySlug: string) => {
		const subcategory = await db.productCategory.findUnique({
			where: { slug: subcategorySlug },
			select: { id: true },
		});

		if (!subcategory) return null;

		const attributes = await db.productAttribute.findMany({
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
	};

	const fetchTagFilters = async (tag: string) => {
		const attributes = await db.productAttribute.findMany({
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
	};

	const cachedSubcategoryFilters = cache(fetchSubcategoryFilters, ['product-filters'], {
		tags: ['product'],
		revalidate: 1200,
	});

	const cachedTagFilters = cache(fetchTagFilters, ['tag-filters'], {
		tags: ['product'],
		revalidate: 1200,
	});

	return {
		getSubcategoryFilters: (subcategorySlug: string) => cachedSubcategoryFilters(subcategorySlug),
		getTagFilters: (tag: string) => cachedTagFilters(tag),
	};
}

const { getSubcategoryFilters, getTagFilters } = buildFilterFetchers(unstable_cache, prisma);

export { getSubcategoryFilters, getTagFilters, buildFilterFetchers };

export async function getSearchFilters(searchQuery: string) {
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
