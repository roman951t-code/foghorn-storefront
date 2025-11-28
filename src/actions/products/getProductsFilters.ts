'use server';

import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

export const getSubcategoryFilters = unstable_cache(
	async (subcategorySlug: string) => {
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
	},
	['product-filters'],
	{
		tags: ['product'],
		revalidate: 1200,
	}
);

export const getTagFilters = unstable_cache(
	async (tag: string) => {
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
	},
	['tag-filters'],
	{ tags: ['product'], revalidate: 1200 }
);

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
