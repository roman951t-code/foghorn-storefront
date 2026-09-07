'use server';

import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';
import { DEFAULT_LOCALE } from '@/constants/locales';
import { prisma } from '@/lib/prisma';
import { PRODUCT_LIST_CACHE_TAG } from '@/constants/products';
import type { SearchProductItem, SearchSubcategoryItem } from '@/types/product';
import { getLocaleFallbacks, pickLocalizedTranslation } from '@/utils/localeFallback';
import { getPublishedProductWhere } from '@/utils/publishSchedule';

// Same query+locale pair returns the same suggestions for every visitor, so
// this is cached like the other product-list lookups in this directory
// rather than hitting Prisma on every typeahead keystroke.
export async function getProductSearchSuggestions(
	query: string,
	locale: string = DEFAULT_LOCALE,
): Promise<{ products: SearchProductItem[]; subcategories: SearchSubcategoryItem[] }> {
	'use cache';
	cacheLife('hours');
	cacheTag(PRODUCT_LIST_CACHE_TAG);

	const localeFallbacks = getLocaleFallbacks(locale);

	const products = await prisma.product.findMany({
		where: {
			OR: [
				{ name: { contains: query, mode: 'insensitive' } },
				{
					translations: {
						some: {
							locale: { in: localeFallbacks },
							name: { contains: query, mode: 'insensitive' },
						},
					},
				},
			],
			AND: [getPublishedProductWhere()],
		},
		orderBy: [{ stock: 'desc' }, { name: 'asc' }],
		take: 7,
		select: {
			name: true,
			slug: true,
			translations: {
				where: { locale: { in: localeFallbacks } },
				select: {
					locale: true,
					name: true,
					categoryName: true,
					subcategoryName: true,
				},
				orderBy: { updatedAt: 'desc' },
			},
			category: {
				select: {
					slug: true,
					name: true,
					translations: {
						where: { locale: { in: localeFallbacks } },
						select: { locale: true, name: true },
						orderBy: { updatedAt: 'desc' },
					},
					parent: {
						select: {
							slug: true,
							name: true,
							translations: {
								where: { locale: { in: localeFallbacks } },
								select: { locale: true, name: true },
								orderBy: { updatedAt: 'desc' },
							},
						},
					},
				},
			},
		},
	});

	const productItems: SearchProductItem[] = products.map((p) => {
		const productTranslation = pickLocalizedTranslation(p.translations, locale);
		const subcategoryTranslation = pickLocalizedTranslation(p.category.translations, locale);
		const categoryTranslation = pickLocalizedTranslation(p.category.parent?.translations, locale);

		return {
			type: 'product' as const,
			name: productTranslation?.name ?? p.name,
			product: p.slug,
			category: p.category.parent?.slug || '',
			subcategory: p.category.slug,
			categoryName:
				productTranslation?.categoryName ??
				categoryTranslation?.name ??
				p.category.parent?.name ??
				'',
			subcategoryName:
				productTranslation?.subcategoryName ?? subcategoryTranslation?.name ?? p.category.name,
		};
	});

	const uniqueSubcategoriesMap = new Map<
		string,
		{ name: string; subcategory: string; category: string }
	>();

	for (const p of products) {
		if (uniqueSubcategoriesMap.size >= 6) break;

		const key = p.category.slug;
		if (!uniqueSubcategoriesMap.has(key)) {
			const subcategoryTranslation = pickLocalizedTranslation(p.category.translations, locale);
			uniqueSubcategoriesMap.set(key, {
				name: subcategoryTranslation?.name ?? p.category.name,
				subcategory: p.category.slug,
				category: p.category.parent?.slug || '',
			});
		}
	}

	return {
		products: productItems,
		subcategories: Array.from(uniqueSubcategoriesMap.values()).map((item) => ({
			type: 'subcategory' as const,
			...item,
		})),
	};
}
