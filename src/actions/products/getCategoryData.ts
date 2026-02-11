'use server';

import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';
import { DEFAULT_LOCALE } from '@/constants/locales';
import { prisma } from '@/lib/prisma';
import { PRODUCT_CATEGORY_CACHE_TAG, PRODUCT_LIST_CACHE_TAG } from '@/constants/products';
import { getLocaleFallbacks, pickLocalizedTranslation } from '@/utils/localeFallback';

export async function getCategoryData(locale: string = DEFAULT_LOCALE) {
	'use cache';
	cacheLife('days');
	cacheTag(PRODUCT_CATEGORY_CACHE_TAG, PRODUCT_LIST_CACHE_TAG);

	const localeFallbacks = getLocaleFallbacks(locale);
	const categories = await prisma.productCategory.findMany({
		where: { parentId: null },
		select: {
			id: true,
			name: true,
			slug: true,
			imageUrl: true,
			translations: {
				where: { locale: { in: localeFallbacks } },
				select: { locale: true, name: true },
				orderBy: { updatedAt: 'desc' },
			},
			children: {
				select: {
					id: true,
					name: true,
					slug: true,
					imageUrl: true,
					translations: {
						where: { locale: { in: localeFallbacks } },
						select: { locale: true, name: true },
						orderBy: { updatedAt: 'desc' },
					},
					products: {
						select: {
							id: true,
							name: true,
							fullSlug: true,
							imageUrl: true,
							translations: {
								where: { locale: { in: localeFallbacks } },
								select: { locale: true, name: true },
								orderBy: { updatedAt: 'desc' },
							},
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

	const categoryData = categories
		.map((category) => {
			const categoryTranslation = pickLocalizedTranslation(category.translations, locale);

			const children = category.children
				.map((child) => {
					const childTranslation = pickLocalizedTranslation(child.translations, locale);
					const products = child.products.map((product) => {
						const productTranslation = pickLocalizedTranslation(product.translations, locale);
						return {
							id: product.id,
							name: productTranslation?.name ?? product.name,
							fullSlug: product.fullSlug,
							imageUrl: product.imageUrl,
						};
					});

					return {
						id: child.id,
						name: childTranslation?.name ?? child.name,
						slug: child.slug,
						imageUrl: child.imageUrl,
						products,
					};
				})
				.sort((a, b) => a.name.localeCompare(b.name, locale));

			return {
				id: category.id,
				name: categoryTranslation?.name ?? category.name,
				slug: category.slug,
				imageUrl: category.imageUrl,
				children,
			};
		})
		.sort((a, b) => a.name.localeCompare(b.name, locale));

	return {
		success: true,
		categoryData,
	};
}
