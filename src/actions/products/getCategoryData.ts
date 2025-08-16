'use server';

import { prisma } from '@/lib/prisma';

export async function getCategoryData() {
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
						},
						orderBy: { name: 'asc' },
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
}
