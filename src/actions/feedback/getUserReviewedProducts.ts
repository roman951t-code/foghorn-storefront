'use server';

import 'server-only';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { Review, SubcategoryProduct } from '@/types/product';
import { getEffectiveDiscountPrice } from '@/utils/discountSchedule';
import { MAX_PRODUCTS_PER_PAGE } from '@/constants/pagination';
import { resolveProductPrimaryImageFromGallery } from '@/utils/productImages';

export type UserReviewedProduct = {
	product: SubcategoryProduct & { fullSlug: string };
	review: Review;
};

export async function getUserReviewedProducts(limit: number, offset = 0) {
	const safeLimit = Math.min(MAX_PRODUCTS_PER_PAGE, Math.max(1, Math.floor(limit || 1)));
	const safeOffset = Math.max(0, Math.floor(offset || 0));

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
							take: 1,
						},
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
				imageUrl: resolveProductPrimaryImageFromGallery(
					r.product.imageUrl,
					r.product.productImages.map((image) => image.url)
				),
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
				isMine: true,
				user: {
					name: r.user?.name ?? '',
					lastName: r.user?.lastName ?? null,
				},
			} as Review,
		}));

	return { items, totalCount };
}
