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
		},
	});

	if (!product) return null;

	return {
		...product,
		basePrice: product.basePrice.toNumber(),
		discountPrice: product.discountPrice?.toNumber() ?? null,
	};
}
