'use server';

import 'server-only';

import { DEFAULT_LOCALE } from '@/constants/locales';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { SubcategoryProduct } from '@/types/product';
import { getEffectiveDiscountPrice } from '@/utils/discountSchedule';
import { getLocaleFallbacks, pickLocalizedTranslation } from '@/utils/localeFallback';
import { buildProductImages } from '@/utils/productImages';
import { getPublishedProductWhere } from '@/utils/publishSchedule';

function mapRecentlyViewedProducts(viewed: { product: any }[], locale: string): SubcategoryProduct[] {
	return viewed
		.map((entry) => {
			const p = entry.product;
			if (!p) return null;
			const translation = pickLocalizedTranslation(
				p.translations as
					| Array<{
							locale: string;
							name: string;
							categoryName: string | null;
							subcategoryName: string | null;
					  }>
					| undefined,
				locale
			);
			const basePrice = Number(p.basePrice ?? 0);
			const scheduledDiscountPrice = getEffectiveDiscountPrice(
				basePrice,
				p.discountPrice != null ? Number(p.discountPrice) : null,
				p.discountStartAt ?? null,
				p.discountEndAt ?? null
			);

			return {
				id: p.id ?? '',
				name: translation?.name ?? p.name ?? '',
				fullSlug: p.fullSlug ?? '',
				imageUrl: p.imageUrl ?? null,
				images: p.productImages?.length
					? p.productImages.map((image: { url: string }) => image.url)
					: buildProductImages(p.imageUrl ?? undefined, 4),
				categoryName: translation?.categoryName ?? p.categoryName ?? '',
				subcategoryName: translation?.subcategoryName ?? p.subcategoryName ?? '',
				inStock: !!p.inStock,
				averageRating: p.averageRating ?? 0,
				reviewCount: p.reviewCount ?? 0,
				basePrice,
				discountPrice: scheduledDiscountPrice,
				defaultVariant: p.variants?.[0]
					? {
							id: p.variants[0].id,
							sku: p.variants[0].sku,
							price: p.variants[0].price?.toNumber?.() ?? Number(p.variants[0].price ?? 0),
							stock: p.variants[0].stock,
							label: (p.variants[0].attributes ?? [])
								.map((a: any) =>
									[a.attribute?.name, a.value, a.attribute?.unit].filter(Boolean).join(' ')
								)
								.join(' / '),
						}
					: undefined,
			} as SubcategoryProduct;
		})
		.filter(Boolean) as SubcategoryProduct[];
}

export async function getRecentlyViewedProductsWithCount(
	userId: string,
	limit = 10,
	offset = 0,
	locale: string = DEFAULT_LOCALE
): Promise<{ products: SubcategoryProduct[]; totalCount: number }> {
	if (!userId) return { products: [], totalCount: 0 };

	const localeFallbacks = getLocaleFallbacks(locale);
	const safeLimit = Math.min(50, Math.max(1, Math.floor(limit || 1)));
	const safeOffset = Math.max(0, Math.floor(offset || 0));
	const now = new Date();
	const recentlyViewedWhere: Prisma.RecentlyViewedWhereInput = {
		userId,
		product: {
			is: getPublishedProductWhere(now),
		},
	};

	const [totalCount, viewed] = await prisma.$transaction([
		prisma.recentlyViewed.count({ where: recentlyViewedWhere }),
		prisma.recentlyViewed.findMany({
			where: recentlyViewedWhere,
			orderBy: { updatedAt: 'desc' },
			skip: safeOffset,
			take: safeLimit,
			include: {
				product: {
					select: {
						id: true,
						name: true,
						fullSlug: true,
						imageUrl: true,
						productImages: {
							select: { url: true, sortOrder: true, createdAt: true },
							orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
							take: 6,
						},
						basePrice: true,
						discountPrice: true,
						discountStartAt: true,
						discountEndAt: true,
						inStock: true,
						categoryName: true,
						subcategoryName: true,
						translations: {
							where: { locale: { in: localeFallbacks } },
							select: { locale: true, name: true, categoryName: true, subcategoryName: true },
							orderBy: { updatedAt: 'desc' },
						},
						averageRating: true,
						reviewCount: true,
						variants: {
							where: { stock: { gt: 0 } },
							orderBy: [{ price: 'asc' }, { createdAt: 'asc' }],
							take: 1,
							select: {
								id: true,
								sku: true,
								price: true,
								stock: true,
								attributes: {
									select: {
										attribute: { select: { name: true, unit: true } },
										value: true,
									},
									orderBy: { attribute: { name: 'asc' } },
								},
							},
						},
					},
				},
			},
		}),
	]);

	return { products: mapRecentlyViewedProducts(viewed, locale), totalCount };
}

export async function getRecentlyViewedProducts(
	userId: string,
	limit = 32,
	offset = 0,
	locale: string = DEFAULT_LOCALE
) {
	const { products } = await getRecentlyViewedProductsWithCount(userId, limit, offset, locale);
	return products;
}
