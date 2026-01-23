'use server';

import 'server-only';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { Review, SubcategoryProduct } from '@/types/product';
import { getEffectiveDiscountPrice } from '@/utils/discountSchedule';

export type UserReviewedProduct = {
	product: SubcategoryProduct & { fullSlug: string };
	review: Review;
};

export async function getUserReviewedProducts(limit: number, offset = 0) {
	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id;

	if (!userId) {
		return { items: [] as UserReviewedProduct[], totalCount: 0 };
	}

	const [totalCount, reviews] = await Promise.all([
		prisma.review.count({ where: { userId } }),
		prisma.review.findMany({
			where: { userId },
			orderBy: { createdAt: 'desc' },
			skip: offset,
			take: limit,
			include: {
				product: {
					select: {
						id: true,
						name: true,
						fullSlug: true,
						imageUrl: true,
						basePrice: true,
						discountPrice: true,
						discountStartAt: true,
						discountEndAt: true,
						inStock: true,
						categoryName: true,
						subcategoryName: true,
						averageRating: true,
						reviewCount: true,
					},
				},
				user: {
					select: { name: true, lastName: true },
				},
			},
		}),
	]);

	const items = reviews
		.filter((r) => r.product)
		.map((r) => ({
			product: {
				id: r.product.id,
				name: r.product.name,
				fullSlug: r.product.fullSlug,
				imageUrl: r.product.imageUrl,
				basePrice: Number(r.product.basePrice ?? 0),
				discountPrice: getEffectiveDiscountPrice(
					Number(r.product.basePrice ?? 0),
					r.product.discountPrice != null ? Number(r.product.discountPrice) : null,
					r.product.discountStartAt ?? null,
					r.product.discountEndAt ?? null
				),
				inStock: !!r.product.inStock,
				categoryName: r.product.categoryName,
				subcategoryName: r.product.subcategoryName,
				averageRating: r.product.averageRating ?? 0,
				reviewCount: r.product.reviewCount ?? 0,
			} as SubcategoryProduct & { fullSlug: string },
			review: {
				id: r.id,
				rating: r.rating,
				comment: r.comment,
				advantages: r.advantages ?? null,
				disadvantages: r.disadvantages ?? null,
				createdAt: r.createdAt,
				user: {
					id: r.userId,
					name: r.user?.name ?? '',
					lastName: r.user?.lastName ?? null,
				},
			} as Review,
		}));

	return { items, totalCount };
}
