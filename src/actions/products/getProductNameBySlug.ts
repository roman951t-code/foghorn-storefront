'use server';

import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';
import { DEFAULT_LOCALE } from '@/constants/locales';
import { prisma } from '@/lib/prisma';
import { getEffectiveDiscountPrice } from '@/utils/discountSchedule';
import { getLocaleFallbacks, pickLocalizedTranslation } from '@/utils/localeFallback';
import { getPublishedProductWhere } from '@/utils/publishSchedule';
import {
	PRODUCT_DETAIL_CACHE_TAG,
	PRODUCT_LIST_CACHE_TAG,
	productCacheTagById,
} from '@/constants/products';

export async function getProductNameBySlug(slug: string, locale: string = DEFAULT_LOCALE) {
	'use cache';
	cacheLife('hours');
	cacheTag(PRODUCT_DETAIL_CACHE_TAG, PRODUCT_LIST_CACHE_TAG);

	const localeFallbacks = getLocaleFallbacks(locale);
	const product = await prisma.product.findFirst({
		where: { slug, AND: [getPublishedProductWhere()] },
		select: {
			id: true,
			name: true,
			description: true,
			imageUrl: true,
			basePrice: true,
			discountPrice: true,
			discountStartAt: true,
			discountEndAt: true,
			translations: {
				where: {
					locale: {
						in: localeFallbacks,
					},
				},
				select: {
					locale: true,
					name: true,
					description: true,
				},
				orderBy: { updatedAt: 'desc' },
			},
		},
	});

	if (!product) return null;
	const translation = pickLocalizedTranslation(product.translations, locale);

	cacheTag(productCacheTagById(product.id));

	const { id, translations, ...rest } = product;
	const basePrice = product.basePrice.toNumber();
	return {
		...rest,
		name: translation?.name ?? product.name,
		description: translation?.description ?? product.description,
		basePrice,
		discountPrice: getEffectiveDiscountPrice(
			basePrice,
			product.discountPrice?.toNumber() ?? null,
			product.discountStartAt ?? null,
			product.discountEndAt ?? null
		),
	};
}
