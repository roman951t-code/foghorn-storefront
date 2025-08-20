'use server';

import { prisma } from '@/lib/prisma';
import { SubcategoryProduct } from '@/types/product';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export async function getWishListProducts(): Promise<{ products: SubcategoryProduct[] }> {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session?.user?.id) return { products: [] };

	const wishlist = await prisma.wishlist.findMany({
		where: { userId: session.user.id },
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
					inStock: true,
					reviews: { select: { rating: true } },
					tags: true,
				},
			},
		},
	});

	const tagPriority = ['popular', 'new', 'discount', 'promotional'];

	const products: SubcategoryProduct[] =
		wishlist?.map(({ product }) => {
			const ratings = product.reviews.map((r) => r.rating);
			const averageRating =
				ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;

			return {
				...product,
				basePrice: Number(product.basePrice),
				discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
				averageRating,
				reviewCount: product.reviews.length,
			};
		}) ?? [];

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
