'use server';

import { prisma } from '@/lib/prisma';

export async function getProductNameBySlug(slug: string) {
	return prisma.product.findUnique({
		where: { slug },
		select: { name: true, description: true, imageUrl: true, basePrice: true, discountPrice: true },
	});
}
