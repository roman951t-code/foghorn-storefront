'use server';

import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import {
	PRODUCT_CATALOG_CACHE_TAG,
	PRODUCT_CATEGORY_CACHE_TAG,
	PRODUCT_LIST_CACHE_TAG,
} from '@/constants/products';

export async function getCatalog() {
	'use cache';
	cacheLife('days');
	cacheTag(PRODUCT_CATALOG_CACHE_TAG, PRODUCT_CATEGORY_CACHE_TAG, PRODUCT_LIST_CACHE_TAG);

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
