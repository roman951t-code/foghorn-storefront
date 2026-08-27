import * as Sentry from '@sentry/nextjs';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { SubcategoryProduct } from '@/types/product';
import { WISHLIST_TAG_PRIORITY } from '@/constants/products';
import { jsonNoStore } from '@/lib/response';
import {
	getEffectiveDiscountPrice,
	getEffectiveVariantDiscountPrice,
} from '@/utils/discountSchedule';
import { getPublishedProductWhere } from '@/utils/publishSchedule';
import { buildLocalizedVariantLabel } from '@/utils/attributeLocalization';
import { getRequestLocale } from '@/utils/i18nServerUtils';

export async function GET() {
	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id;

	if (!userId) {
		return jsonNoStore({ success: false, items: [] }, { status: 401 });
	}

	try {
		const locale = await getRequestLocale();
		const now = new Date();
		const wishlist = await prisma.wishlist.findMany({
			where: {
				userId: session.user.id,
				product: getPublishedProductWhere(now),
			},
			include: {
				product: {
					select: {
						id: true,
						name: true,
						fullSlug: true,
						imageUrl: true,
						basePrice: true,
						categoryName: true,
						subcategoryName: true,
						discountPrice: true,
						discountStartAt: true,
						discountEndAt: true,
						inStock: true,
						reviews: { select: { rating: true } },
						tags: true,
						variants: {
							where: { stock: { gt: 0 } },
							orderBy: [{ price: 'asc' }, { createdAt: 'asc' }],
							take: 1,
							select: {
								id: true,
								sku: true,
								price: true,
								discountPrice: true,
								discountStartAt: true,
								discountEndAt: true,
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
		});

		const products: SubcategoryProduct[] =
			wishlist?.map(({ product }) => {
				const ratings = product.reviews.map((r) => r.rating);
				const averageRating =
					ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
				const productBasePrice = Number(product.basePrice ?? 0);
				const defaultVariant = product.variants?.[0];
				const basePrice = defaultVariant
					? (defaultVariant.price?.toNumber?.() ?? Number(defaultVariant.price ?? 0))
					: productBasePrice;
				const discountPrice = defaultVariant
					? getEffectiveVariantDiscountPrice({
							variantBasePrice: basePrice,
							variantDiscountPrice: defaultVariant.discountPrice?.toNumber?.() ?? null,
							variantDiscountStartAt: defaultVariant.discountStartAt ?? null,
							variantDiscountEndAt: defaultVariant.discountEndAt ?? null,
							productBasePrice,
							productDiscountPrice: product.discountPrice ? Number(product.discountPrice) : null,
							productDiscountStartAt: product.discountStartAt ?? null,
							productDiscountEndAt: product.discountEndAt ?? null,
						})
					: getEffectiveDiscountPrice(
							productBasePrice,
							product.discountPrice ? Number(product.discountPrice) : null,
							product.discountStartAt ?? null,
							product.discountEndAt ?? null,
						);
				const variantLabel =
					buildLocalizedVariantLabel(
						defaultVariant?.attributes?.map((a) => ({
							name: a.attribute.name,
							value: a.value,
							unit: a.attribute.unit,
						})),
						locale
					) ?? '';

				return {
					...product,
					basePrice,
					discountPrice,
					defaultVariant: defaultVariant
						? {
								id: defaultVariant.id,
								sku: defaultVariant.sku,
								price: basePrice,
								discountPrice,
								stock: defaultVariant.stock,
								label: variantLabel,
							}
						: undefined,
					averageRating,
					reviewCount: product.reviews.length,
				};
			}) ?? [];

		const sortedProducts =
			products?.sort((a, b) => {
				const aScore = Math.min(
					...WISHLIST_TAG_PRIORITY.map((tag, i) =>
						a.tags?.includes(tag) ? i : WISHLIST_TAG_PRIORITY.length,
					),
				);
				const bScore = Math.min(
					...WISHLIST_TAG_PRIORITY.map((tag, i) =>
						b.tags?.includes(tag) ? i : WISHLIST_TAG_PRIORITY.length,
					),
				);
				return aScore - bScore;
			}) ?? [];

		return jsonNoStore({ success: true, items: sortedProducts });
	} catch (error) {
		Sentry.captureException(error);
		return jsonNoStore({ success: false, items: [] }, { status: 500 });
	}
}
