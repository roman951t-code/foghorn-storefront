import { prisma } from '@/lib/prisma';

export async function getProductBySlug(slug: string) {
	const product = await prisma.product.findUnique({
		where: { slug },
		select: {
			id: true,
			name: true,
			fullSlug: true,
			slug: true,
			imageUrl: true,
			basePrice: true,
			discountPrice: true,
			productCode: true,
			inStock: true,
			averageRating: true,
			reviewCount: true,
			categoryName: true,
			subcategoryName: true,
			attributes: {
				select: {
					attribute: { select: { name: true, unit: true } },
					value: true,
				},
			},
			reviews: {
				select: {
					id: true,
					rating: true,
					comment: true,
					advantages: true,
					disadvantages: true,
					createdAt: true,
					user: {
						select: { id: true, name: true, lastName: true },
					},
				},
				orderBy: { createdAt: 'desc' },
			},
		},
	});

	if (!product) return null;

	return {
		...product,
		basePrice: product.basePrice.toNumber(),
		discountPrice: product.discountPrice?.toNumber() ?? null,
		attributes: product.attributes.map((attr) => ({
			name: attr.attribute.name,
			unit: attr.attribute.unit,
			value: attr.value,
		})),
		// reviews: product.reviews.map((review) => ({
		// 	rating: review.rating,
		// 	comment: review.comment,
		// 	createdAt: new Date(review.createdAt),
		// 	user: review.user,
		// })),
	};
}
