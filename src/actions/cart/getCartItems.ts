'use server';

import 'server-only';

import { prisma } from '@/lib/prisma';
import { getEffectiveVariantDiscountPrice } from '@/utils/discountSchedule';
import { resolveProductPrimaryImageFromGallery } from '@/utils/productImages';

export async function getCartItems(userId: string) {
	if (!userId) {
		return { success: false, items: [] };
	}

	try {
		const cart = await prisma.cart.findUnique({
			where: { userId },
			include: {
				items: {
					include: {
						product: {
							select: {
								id: true,
								name: true,
								fullSlug: true,
								imageUrl: true,
								stock: true,
								productImages: {
									select: { url: true, sortOrder: true, createdAt: true },
									orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
									take: 1,
								},
								basePrice: true,
								discountPrice: true,
								discountStartAt: true,
								discountEndAt: true,
							},
						},
						variant: {
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

		const reshapedItems =
			cart?.items.map((item) => {
				const productBasePrice = item.product.basePrice?.toNumber?.() ?? 0;
				const variantBasePrice = item.variant?.price?.toNumber?.() ?? productBasePrice;
				const variantDiscountPrice = getEffectiveVariantDiscountPrice({
					variantBasePrice,
					variantDiscountPrice: item.variant?.discountPrice?.toNumber?.() ?? null,
					variantDiscountStartAt: item.variant?.discountStartAt ?? null,
					variantDiscountEndAt: item.variant?.discountEndAt ?? null,
					productBasePrice,
					productDiscountPrice: item.product.discountPrice?.toNumber?.() ?? null,
					productDiscountStartAt: item.product.discountStartAt ?? null,
					productDiscountEndAt: item.product.discountEndAt ?? null,
				});

				const variantLabel =
					item.variant?.attributes?.length
						? item.variant.attributes
								.map((a) => {
									const name = a.attribute.name?.trim?.() ?? '';
									const valueWithUnit = [a.value, a.attribute.unit].filter(Boolean).join(' ').trim();
									if (name && valueWithUnit) return `${name}: ${valueWithUnit}`;
									return name || valueWithUnit;
								})
								.join(' / ')
						: null;

				return {
					lineId: item.id,
					productId: item.product.id,
					variantId: item.variant?.id ?? item.variantId ?? null,
					availableStock: item.variant?.stock ?? item.product.stock ?? null,
					sku: item.variant?.sku ?? null,
					variantLabel,
					quantity: item.quantity,
					basePrice: variantBasePrice,
					discountPrice: variantDiscountPrice,
					name: item.product.name,
					fullSlug: item.product.fullSlug,
					imageUrl: resolveProductPrimaryImageFromGallery(
						item.product.imageUrl,
						item.product.productImages.map((image) => image.url)
					),
				};
			}) ?? [];

		return { success: true, items: reshapedItems };
	} catch (error) {
		return {
			success: false,
			items: [],
		};
	}
}
