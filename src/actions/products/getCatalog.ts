'use server';

import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

export const getCatalog = unstable_cache(
	async () => {
		const catalog = await prisma.productCategory.findMany({
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

		return { success: true, catalog };
	},
	['catalog', 'with-images-v2'],
	{ revalidate: 3600 }
);
