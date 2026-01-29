'use server';
import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { buildProductImages } from '@/utils/productImages';
import { getEffectiveDiscountPrice } from '@/utils/discountSchedule';
import { getPublishedProductWhere } from '@/utils/publishSchedule';
import {
	PRODUCT_DETAIL_CACHE_TAG,
	PRODUCT_LIST_CACHE_TAG,
	productCacheTagById,
} from '@/constants/products';

async function fetchProductBySlug(slug: string) {
	const product = await prisma.product.findFirst({
		where: { slug, AND: [getPublishedProductWhere()] },
		select: {
			id: true,
			name: true,
			fullSlug: true,
			slug: true,
			description: true,
			imageUrl: true,
			basePrice: true,
			discountPrice: true,
			discountStartAt: true,
			discountEndAt: true,
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
			variants: {
				select: {
					id: true,
					sku: true,
					price: true,
					stock: true,
					attributes: {
						select: {
							attribute: { select: { id: true, name: true, unit: true } },
							value: true,
						},
					},
				},
				orderBy: [{ stock: 'desc' }, { price: 'asc' }, { createdAt: 'asc' }],
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
	const basePrice = product.basePrice.toNumber();
	return {
		...product,
		basePrice,
		discountPrice: getEffectiveDiscountPrice(
			basePrice,
			product.discountPrice?.toNumber() ?? null,
			product.discountStartAt ?? null,
			product.discountEndAt ?? null
		),
		images,
		attributes: product.attributes.map((a) => ({
			name: a.attribute.name,
			unit: a.attribute.unit,
			value: a.value,
		})),
		variants: product.variants.map((v) => ({
			...v,
			price: v.price.toNumber(),
			attributes: v.attributes.map((a) => ({
				attributeId: a.attribute.id,
				name: a.attribute.name,
				unit: a.attribute.unit,
				value: a.value,
			})),
		})),
	};
}

export async function getProductBySlugCached(slug: string) {
	'use cache';
	cacheLife('hours');
	cacheTag(PRODUCT_DETAIL_CACHE_TAG, PRODUCT_LIST_CACHE_TAG);

	const product = await fetchProductBySlug(slug);
	if (product?.id) {
		cacheTag(productCacheTagById(product.id));
	}

	return product;
}

export async function getProductBySlug(slug: string) {
	return fetchProductBySlug(slug);
}
