'use server';

import 'server-only';

import { prisma } from '@/lib/prisma';
import { SubcategoryProduct } from '@/types/product';
import { isProductPublished } from '@/utils/publishSchedule';

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
					basePrice: true,
					categoryName: true,
					subcategoryName: true,
					discountPrice: true,
					status: true,
					publishStartAt: true,
					publishEndAt: true,
					inStock: true,
					averageRating: true,
					reviewCount: true,
					tags: true,
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
			acc.push({
				id: product.id,
				name: product.name,
				fullSlug: product.fullSlug,
				imageUrl: product.imageUrl ?? null,
				categoryName: product.categoryName ?? '',
				subcategoryName: product.subcategoryName ?? '',
				tags: product.tags ?? [],
				inStock: product.inStock ?? false,
				basePrice: Number(product.basePrice),
				discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
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
