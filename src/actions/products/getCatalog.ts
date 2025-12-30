'use server';

import 'server-only';

import { prisma } from '@/lib/prisma';

export async function getCatalog() {
	const catalog = await prisma.productCategory.findMany({
		where: { parentId: null },
		select: {
			id: true,
			name: true,
			slug: true,
			imageUrl: true,
			children: {
				select: {
					id: true,
					name: true,
					slug: true,
					imageUrl: true,
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
}
