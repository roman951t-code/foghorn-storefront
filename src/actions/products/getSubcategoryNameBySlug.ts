'use server';

import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

export const getSubcategoryNameBySlug = unstable_cache(
	async (slug: string) => {
		const subcategory = await prisma.productCategory.findUnique({
			where: { slug },
			select: {
				name: true,
				parent: { select: { name: true } },
			},
		});

		if (!subcategory) return null;

		return {
			categoryName: subcategory.parent?.name || '',
			subcategoryName: subcategory.name,
		};
	},
	['subcategory-name'],
	{
		tags: ['subcategory'],
	}
);
