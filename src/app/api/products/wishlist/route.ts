import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { SubcategoryProduct } from '@/types/product';
import { WISHLIST_TAG_PRIORITY } from '@/constants/products';
import { jsonNoStore } from '@/lib/response';

export async function GET() {
	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id;

	if (!userId) {
		return jsonNoStore({ success: false, items: [] }, { status: 401 });
	}

	try {
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
					...WISHLIST_TAG_PRIORITY.map((tag, i) =>
						a.tags?.includes(tag) ? i : WISHLIST_TAG_PRIORITY.length
					)
				);
				const bScore = Math.min(
					...WISHLIST_TAG_PRIORITY.map((tag, i) =>
						b.tags?.includes(tag) ? i : WISHLIST_TAG_PRIORITY.length
					)
				);
				return aScore - bScore;
			}) ?? [];

		return jsonNoStore({ success: true, items: sortedProducts });
	} catch (error) {
		return jsonNoStore({ success: false, items: [] }, { status: 500 });
	}
}
