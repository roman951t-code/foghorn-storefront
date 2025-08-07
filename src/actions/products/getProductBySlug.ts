import { prisma } from '@/lib/prisma';
export async function getProductBySlug(slug: string) {
	const product = await prisma.product.findUnique({
		where: { slug },
		select: {
			id: true,
			name: true,
			slug: true,
			imageUrl: true,
			basePrice: true,
			discountPrice: true,
			productCode: true,
			inStock: true,
			averageRating: true,
			reviewCount: true,
			category: {
				select: {
					name: true,
					slug: true,
					parent: {
						select: {
							name: true,
							slug: true,
						},
					},
				},
			},
			attributes: {
				select: {
					attribute: {
						select: { name: true, unit: true },
					},
					value: true,
				},
			},
			reviews: {
				select: {
					rating: true,
					comment: true,
					createdAt: true,
					user: {
						select: { name: true, image: true },
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
		categoryName: product.category?.parent?.name || '',
		subcategoryName: product.category?.name || '',
		attributes: product.attributes.map((attr) => ({
			name: attr.attribute.name,
			unit: attr.attribute.unit,
			value: attr.value,
		})),
		reviews: product.reviews.map((review) => ({
			rating: review.rating,
			comment: review.comment,
			createdAt: review.createdAt,
			user: review.user,
		})),
	};
}
