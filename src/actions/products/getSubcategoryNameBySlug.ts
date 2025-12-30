'use server';

import 'server-only';

import { prisma } from '@/lib/prisma';

export async function getSubcategoryNameBySlug(slug: string) {
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
