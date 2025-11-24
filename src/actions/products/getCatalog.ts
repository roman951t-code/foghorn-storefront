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
							},
							orderBy: { name: 'asc' },
							take: 5,
						},
					},
				},
			},
			orderBy: { name: 'asc' },
		});

		return { success: true, catalog };
	},
	['catalog'],
	{ revalidate: 300 }
);
