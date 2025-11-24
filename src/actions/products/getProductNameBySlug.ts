'use server';

import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

export const getProductNameBySlug = unstable_cache(
	async (slug: string) => {
		return prisma.product.findUnique({
			where: { slug },
			select: { name: true },
		});
	},
	['product-name'],
	{
		tags: ['product'],
		revalidate: 300,
	}
);
