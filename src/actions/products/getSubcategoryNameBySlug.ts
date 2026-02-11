'use server';

import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';
import { DEFAULT_LOCALE } from '@/constants/locales';
import { prisma } from '@/lib/prisma';
import { PRODUCT_CATEGORY_CACHE_TAG } from '@/constants/products';
import { getLocaleFallbacks, pickLocalizedTranslation } from '@/utils/localeFallback';

export async function getSubcategoryNameBySlug(slug: string, locale: string = DEFAULT_LOCALE) {
	'use cache';
	cacheLife('days');
	cacheTag(PRODUCT_CATEGORY_CACHE_TAG);

	const localeFallbacks = getLocaleFallbacks(locale);
	const subcategory = await prisma.productCategory.findUnique({
		where: { slug },
		select: {
			name: true,
			translations: {
				where: {
					locale: {
						in: localeFallbacks,
					},
				},
				select: {
					locale: true,
					name: true,
				},
				orderBy: { updatedAt: 'desc' },
			},
			parent: {
				select: {
					name: true,
					translations: {
						where: {
							locale: {
								in: localeFallbacks,
							},
						},
						select: {
							locale: true,
							name: true,
						},
						orderBy: { updatedAt: 'desc' },
					},
				},
			},
		},
	});

	if (!subcategory) return null;
	const subcategoryTranslation = pickLocalizedTranslation(subcategory.translations, locale);
	const parentTranslation = pickLocalizedTranslation(subcategory.parent?.translations, locale);

	return {
		categoryName: parentTranslation?.name ?? subcategory.parent?.name ?? '',
		subcategoryName: subcategoryTranslation?.name ?? subcategory.name,
	};
}
