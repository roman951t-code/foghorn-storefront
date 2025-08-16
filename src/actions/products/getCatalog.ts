'use server';

import { prisma } from '@/lib/prisma';

export async function getCatalog() {
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
							slug: true,
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
		catalog,
	};
}
