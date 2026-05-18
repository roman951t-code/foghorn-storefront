'use server';

import 'server-only';

import { prisma } from '@/lib/prisma';
import { SubcategoryProduct } from '@/types/product';
import {
	getEffectiveDiscountPrice,
	getEffectiveVariantDiscountPrice,
} from '@/utils/discountSchedule';
import { isProductPublished } from '@/utils/publishSchedule';
import { resolveProductPrimaryImageFromGallery } from '@/utils/productImages';

export async function getWishListProducts(
	userId: string
): Promise<{ products: SubcategoryProduct[] }> {
	if (!userId) return { products: [] };

	const wishlist = await prisma.wishlist.findMany({
		where: { userId },
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
						take: 1,
					},
					basePrice: true,
					categoryName: true,
					subcategoryName: true,
					discountPrice: true,
					discountStartAt: true,
					discountEndAt: true,
					status: true,
					publishStartAt: true,
					publishEndAt: true,
					inStock: true,
					averageRating: true,
					reviewCount: true,
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

	const tagPriority = ['popular', 'new', 'discount', 'promotional'];

	const products: SubcategoryProduct[] =
		wishlist?.reduce<SubcategoryProduct[]>((acc, { product }) => {
			if (!isProductPublished(product.status, product.publishStartAt, product.publishEndAt)) {
				return acc;
			}
			const productBasePrice = Number(product.basePrice ?? 0);
			const defaultVariant = product.variants?.[0];
			const basePrice = defaultVariant ? Number(defaultVariant.price ?? 0) : productBasePrice;
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
						product.discountEndAt ?? null
				  );

			acc.push({
				id: product.id,
				name: product.name,
				fullSlug: product.fullSlug,
				imageUrl: resolveProductPrimaryImageFromGallery(
					product.imageUrl,
					product.productImages.map((image) => image.url)
				),
				categoryName: product.categoryName ?? '',
				subcategoryName: product.subcategoryName ?? '',
				tags: product.tags ?? [],
				inStock: product.inStock ?? false,
				basePrice,
				discountPrice,
				defaultVariant: defaultVariant
					? {
							id: defaultVariant.id,
							sku: defaultVariant.sku,
							price: Number(defaultVariant.price ?? 0),
							discountPrice,
							stock: defaultVariant.stock,
							label: defaultVariant.attributes
								.map((a) => {
									const name = a.attribute.name?.trim?.() ?? '';
									const valueWithUnit = [a.value, a.attribute.unit].filter(Boolean).join(' ').trim();
									if (name && valueWithUnit) return `${name}: ${valueWithUnit}`;
									return name || valueWithUnit;
								})
								.join(' / '),
					  }
					: undefined,
				averageRating: Number(product.averageRating ?? 0),
				reviewCount: Number(product.reviewCount ?? 0),
			});
			return acc;
		}, []) ?? [];

	const sortedProducts =
		products?.sort((a, b) => {
			const aScore = Math.min(
				...tagPriority.map((tag, i) => (a.tags?.includes(tag) ? i : tagPriority.length))
			);
			const bScore = Math.min(
				...tagPriority.map((tag, i) => (b.tags?.includes(tag) ? i : tagPriority.length))
			);
			return aScore - bScore;
		}) ?? [];

	return { products: sortedProducts };
}
