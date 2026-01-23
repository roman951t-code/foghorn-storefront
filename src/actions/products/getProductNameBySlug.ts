'use server';

import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getEffectiveDiscountPrice } from '@/utils/discountSchedule';
import {
	PRODUCT_DETAIL_CACHE_TAG,
	PRODUCT_LIST_CACHE_TAG,
	productCacheTagById,
} from '@/constants/products';

export async function getProductNameBySlug(slug: string) {
	'use cache';
	cacheLife('hours');
	cacheTag(PRODUCT_DETAIL_CACHE_TAG, PRODUCT_LIST_CACHE_TAG);

	const product = await prisma.product.findFirst({
		where: { slug, status: 'ACTIVE' },
		select: {
			id: true,
			name: true,
			description: true,
			imageUrl: true,
			basePrice: true,
			discountPrice: true,
			discountStartAt: true,
			discountEndAt: true,
		},
	});

	if (!product) return null;

	cacheTag(productCacheTagById(product.id));

	const { id, ...rest } = product;
	const basePrice = product.basePrice.toNumber();
	return {
		...rest,
		basePrice,
		discountPrice: getEffectiveDiscountPrice(
			basePrice,
			product.discountPrice?.toNumber() ?? null,
			product.discountStartAt ?? null,
			product.discountEndAt ?? null
		),
	};
}
