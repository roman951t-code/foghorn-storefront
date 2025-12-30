'use server';
import 'server-only';

import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import { buildProductImages } from '@/utils/productImages';

async function fetchProductBySlug(slug: string) {
	const product = await prisma.product.findUnique({
		where: { slug },
		select: {
			id: true,
			name: true,
			fullSlug: true,
			slug: true,
			description: true,
			imageUrl: true,
			basePrice: true,
			discountPrice: true,
			productCode: true,
			inStock: true,
			averageRating: true,
			reviewCount: true,
			categoryName: true,
			subcategoryName: true,
			brand: { select: { name: true } },
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
	const images = buildProductImages(product.imageUrl ?? undefined, 4);
	return {
		...product,
		basePrice: product.basePrice.toNumber(),
		discountPrice: product.discountPrice?.toNumber() ?? null,
		images,
		attributes: product.attributes.map((a) => ({
			name: a.attribute.name,
			unit: a.attribute.unit,
			value: a.value,
		})),
	};
}

export const getProductBySlugCached = cache(fetchProductBySlug);

export async function getProductBySlug(slug: string) {
	return fetchProductBySlug(slug);
}
