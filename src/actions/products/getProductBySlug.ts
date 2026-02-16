'use server';
import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';
import { DEFAULT_LOCALE } from '@/constants/locales';
import { prisma } from '@/lib/prisma';
import { buildProductImages, resolveProductPrimaryImage } from '@/utils/productImages';
import { getEffectiveDiscountPrice } from '@/utils/discountSchedule';
import { getLocaleFallbacks, pickLocalizedTranslation } from '@/utils/localeFallback';
import { getPublishedProductWhere } from '@/utils/publishSchedule';
import {
	PRODUCT_DETAIL_CACHE_TAG,
	PRODUCT_LIST_CACHE_TAG,
	productCacheTagById,
} from '@/constants/products';

async function fetchProductBySlug(slug: string, locale: string = DEFAULT_LOCALE) {
	const localeFallbacks = getLocaleFallbacks(locale);
	const product = await prisma.product.findFirst({
		where: { slug, AND: [getPublishedProductWhere()] },
		select: {
			id: true,
			name: true,
			fullSlug: true,
			slug: true,
			description: true,
			guarantee: true,
			metaTitle: true,
			metaDescription: true,
			canonicalUrl: true,
			openGraphImage: true,
			imageUrl: true,
			productImages: {
				select: { url: true, sortOrder: true, createdAt: true },
				orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
			},
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
			translations: {
				where: { locale: { in: localeFallbacks } },
				select: {
					locale: true,
					name: true,
					description: true,
					guarantee: true,
					metaTitle: true,
					metaDescription: true,
					categoryName: true,
					subcategoryName: true,
				},
				orderBy: { updatedAt: 'desc' },
			},
			category: {
				select: {
					attributeSet: {
						select: {
							items: {
								select: {
									attributeId: true,
									sortOrder: true,
									attribute: { select: { id: true, name: true, unit: true } },
								},
								orderBy: [{ sortOrder: 'asc' }, { attributeId: 'asc' }],
							},
						},
					},
				},
			},
			brand: { select: { name: true } },
			attributes: {
				select: {
					attribute: { select: { id: true, name: true, unit: true } },
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
	const translation = pickLocalizedTranslation(product.translations, locale);
	const persistedImages = product.productImages.map((image) => image.url).filter(Boolean);
	const primaryImageUrl = resolveProductPrimaryImage(product.imageUrl);
	const images = persistedImages.length
		? persistedImages
		: buildProductImages(product.imageUrl ?? undefined, 4);
	const basePrice = product.basePrice.toNumber();
	const attributeSetItems = product.category?.attributeSet?.items ?? [];

	const attributeValueById = new Map<
		string,
		{ id: string; name: string; unit: string | null; value: string }
	>();
	for (const a of product.attributes) {
		attributeValueById.set(a.attribute.id, {
			id: a.attribute.id,
			name: a.attribute.name,
			unit: a.attribute.unit,
			value: a.value,
		});
	}

	const attributeIdsInSet = new Set(attributeSetItems.map((i) => i.attributeId));

	const setAttributes =
		attributeSetItems.length > 0
			? attributeSetItems.map((item) => {
					const id = item.attribute.id;
					const existing = attributeValueById.get(id);
					return {
						id,
						name: item.attribute.name,
						unit: item.attribute.unit,
						value: existing?.value ?? null,
					};
			  })
			: [];

	const extraAttributes =
		attributeSetItems.length > 0
			? [...attributeValueById.values()]
					.filter((a) => !attributeIdsInSet.has(a.id))
					.sort((a, b) => a.name.localeCompare(b.name))
					.map((a) => ({ ...a, value: a.value }))
			: [...attributeValueById.values()].sort((a, b) => a.name.localeCompare(b.name));

	const mergedAttributes =
		attributeSetItems.length > 0
			? [...setAttributes, ...extraAttributes]
			: extraAttributes.map((a) => ({ ...a, value: a.value }));

	const { category, productImages, translations, ...productWithoutCategory } = product;
	return {
		...productWithoutCategory,
		imageUrl: primaryImageUrl,
		name: translation?.name ?? product.name,
		description: translation?.description ?? product.description,
		guarantee: translation?.guarantee ?? product.guarantee,
		metaTitle: translation?.metaTitle ?? product.metaTitle,
		metaDescription: translation?.metaDescription ?? product.metaDescription,
		categoryName: translation?.categoryName ?? product.categoryName,
		subcategoryName: translation?.subcategoryName ?? product.subcategoryName,
		basePrice,
		discountPrice: getEffectiveDiscountPrice(
			basePrice,
			product.discountPrice?.toNumber() ?? null,
			product.discountStartAt ?? null,
			product.discountEndAt ?? null
		),
		images: images.length > 0 ? images : [primaryImageUrl],
		attributes: mergedAttributes.map((a) => ({
			name: a.name,
			unit: a.unit,
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

export async function getProductBySlugCached(slug: string, locale: string = DEFAULT_LOCALE) {
	'use cache';
	cacheLife('hours');
	cacheTag(PRODUCT_DETAIL_CACHE_TAG, PRODUCT_LIST_CACHE_TAG);

	const product = await fetchProductBySlug(slug, locale);
	if (product?.id) {
		cacheTag(productCacheTagById(product.id));
	}

	return product;
}

export async function getProductBySlug(slug: string, locale: string = DEFAULT_LOCALE) {
	return fetchProductBySlug(slug, locale);
}
