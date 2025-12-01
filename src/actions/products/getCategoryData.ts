'use server';

import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

export const getCategoryData = unstable_cache(
	async () => {
		const categoryData = await prisma.productCategory.findMany({
			where: { parentId: null },
			include: {
				children: {
					select: {
						id: true,
						name: true,
						slug: true,
						products: {
							select: {
								id: true,
								name: true,
								fullSlug: true,
								imageUrl: true,
							},
							where: { imageUrl: { not: null } },
							orderBy: { createdAt: 'desc' },
							take: 5,
						},
					},
				},
			},
			orderBy: { name: 'asc' },
		});

		return {
			success: true,
			categoryData,
		};
	},
	['category-data', 'with-images-v2'],
	{ revalidate: 3600, tags: ['categories'] }
);
