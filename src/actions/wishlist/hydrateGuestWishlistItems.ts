'use server';

import 'server-only';

import { prisma } from '@/lib/prisma';
import { WISHLIST_TAG_PRIORITY } from '@/constants/products';
import type { SubcategoryProduct } from '@/types/product';
import {
	getEffectiveDiscountPrice,
	getEffectiveVariantDiscountPrice,
} from '@/utils/discountSchedule';
import { getPublishedProductWhere } from '@/utils/publishSchedule';

const MAX_GUEST_WISHLIST_ITEMS = 100;

const normalizeIds = (ids: string[]) =>
	Array.from(
		new Set(
			(Array.isArray(ids) ? ids : [])
				.map((id) => (typeof id === 'string' ? id.trim() : ''))
				.filter(Boolean),
		),
	).slice(0, MAX_GUEST_WISHLIST_ITEMS);

export async function hydrateGuestWishlistItems(ids: string[]): Promise<SubcategoryProduct[]> {
	const normalizedIds = normalizeIds(ids);
	if (normalizedIds.length === 0) return [];

	const products = await prisma.product.findMany({
		where: { id: { in: normalizedIds }, AND: [getPublishedProductWhere()] },
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
	});

	const orderById = new Map(normalizedIds.map((id, index) => [id, index]));
	const hydrated: SubcategoryProduct[] = products.map((product) => {
		const ratings = product.reviews.map((review) => review.rating);
		const averageRating = ratings.length
			? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
			: 0;
		const productBasePrice = product.basePrice?.toNumber?.() ?? Number(product.basePrice ?? 0);
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
					productDiscountPrice: product.discountPrice?.toNumber?.() ?? null,
					productDiscountStartAt: product.discountStartAt ?? null,
					productDiscountEndAt: product.discountEndAt ?? null,
				})
			: getEffectiveDiscountPrice(
					productBasePrice,
					product.discountPrice?.toNumber?.() ?? null,
					product.discountStartAt ?? null,
					product.discountEndAt ?? null,
				);
		const variantLabel = defaultVariant?.attributes?.length
			? defaultVariant.attributes
					.map((attributeValue) => {
						const name = attributeValue.attribute.name?.trim?.() ?? '';
						const valueWithUnit = [attributeValue.value, attributeValue.attribute.unit]
							.filter(Boolean)
							.join(' ')
							.trim();
						if (name && valueWithUnit) return `${name}: ${valueWithUnit}`;
						return name || valueWithUnit;
					})
					.join(' / ')
			: '';

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
	});

	return hydrated.sort((a, b) => {
		const aTagScore = Math.min(
			...WISHLIST_TAG_PRIORITY.map((tag, index) =>
				a.tags?.includes(tag) ? index : WISHLIST_TAG_PRIORITY.length,
			),
		);
		const bTagScore = Math.min(
			...WISHLIST_TAG_PRIORITY.map((tag, index) =>
				b.tags?.includes(tag) ? index : WISHLIST_TAG_PRIORITY.length,
			),
		);
		if (aTagScore !== bTagScore) return aTagScore - bTagScore;
		return (orderById.get(a.id) ?? 0) - (orderById.get(b.id) ?? 0);
	});
}
