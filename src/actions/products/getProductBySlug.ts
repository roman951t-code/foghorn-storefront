'use server';
import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

export const getProductBySlug = unstable_cache(
	async (slug: string) => {
		const product = await prisma.product.findUnique({
			where: { slug },
			select: {
				id: true,
				name: true,
				fullSlug: true,
				slug: true,
				imageUrl: true,
				basePrice: true,
				discountPrice: true,
				productCode: true,
				inStock: true,
				averageRating: true,
				reviewCount: true,
				categoryName: true,
				subcategoryName: true,
				attributes: {
					select: {
						attribute: { select: { name: true, unit: true } },
						value: true,
					},
				},
				reviews: {
					select: {
						id: true,
						rating: true,
						comment: true,
						advantages: true,
						disadvantages: true,
						createdAt: true,
						user: {
							select: { id: true, name: true, lastName: true },
						},
					},
					orderBy: { createdAt: 'desc' },
				},
			},
		});

		if (!product) return null;
		return {
			...product,
			basePrice: product.basePrice.toNumber(),
			discountPrice: product.discountPrice?.toNumber() ?? null,
			attributes: product.attributes.map((a) => ({
				name: a.attribute.name,
				unit: a.attribute.unit,
				value: a.value,
			})),
		};
	},
	['product-by-slug'],
	{ revalidate: 300, tags: ['products'] }
);
