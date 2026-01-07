'use server';

import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { PRODUCT_CATEGORY_CACHE_TAG } from '@/constants/products';

export async function getSubcategoryNameBySlug(slug: string) {
	'use cache';
	cacheLife('days');
	cacheTag(PRODUCT_CATEGORY_CACHE_TAG);

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
}
