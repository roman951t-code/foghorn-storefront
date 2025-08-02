import { prisma } from '@/lib/prisma';
import { Product } from '@prisma/client';

export async function getProductsBySubcategorySlug(
	slug: string,
	limit: number = 12,
	offset: number = 0
): Promise<Product[]> {
	const subcategory = await prisma.productCategory.findUnique({
		where: { slug },
		select: {
			products: {
				orderBy: { name: 'asc' },
				take: limit,
				skip: offset,
				select: {
					id: true,
					name: true,
					slug: true,
					imageUrl: true,
					basePrice: true,
					discountPrice: true,
					reviews: {
						select: {
							rating: true,
						},
					},
				},
			},
		},
	});

	if (!subcategory) return [];

	const products: Product[] = subcategory.products.map((product) => {
		const ratings = product.reviews.map((r) => r.rating);
		const averageRating =
			ratings.length > 0 ? ratings.reduce((sum, val) => sum + val, 0) / ratings.length : 0;

		return {
			id: product.id,
			name: product.name,
			slug: product.slug,
			imageUrl: product.imageUrl ?? '',
			basePrice: Number(product.basePrice),
			discountPrice: product.discountPrice ? Number(product.discountPrice) : undefined,
			averageRating,
			reviewCount: product.reviews.length,
		};
	});

	return products;
}
