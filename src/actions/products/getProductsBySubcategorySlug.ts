import { prisma } from '@/lib/prisma';
import { Product } from '@/types/product';

export async function getProductsBySubcategorySlug(
	slug: string,
	limit: number = 12,
	offset: number = 0
): Promise<{
	categoryName: string;
	subcategoryName: string;
	products: Product[];
}> {
	const subcategory = await prisma.productCategory.findUnique({
		where: { slug },
		include: {
			parent: true,
			products: {
				orderBy: [{ inStock: 'desc' }, { name: 'asc' }],
				skip: offset,
				take: limit,
				select: {
					id: true,
					name: true,
					slug: true,
					imageUrl: true,
					basePrice: true,
					discountPrice: true,
					inStock: true,
					reviews: { select: { rating: true } },
				},
			},
			_count: {
				select: { products: true },
			},
		},
	});

	if (!subcategory) {
		return {
			categoryName: '',
			subcategoryName: '',
			products: [],
		};
	}

	const products: Product[] = subcategory.products.map((product) => {
		const ratings = product.reviews.map((r) => r.rating);
		const averageRating =
			ratings.length > 0 ? ratings.reduce((sum, val) => sum + val, 0) / ratings.length : 0;

		return {
			id: product.id,
			name: product.name,
			slug: product.slug,
			inStock: product.inStock,
			imageUrl: product.imageUrl ?? '',
			basePrice: Number(product.basePrice),
			discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
			averageRating,
			reviewCount: product.reviews.length,
		};
	});

	return {
		categoryName: subcategory.parent?.name || '',
		subcategoryName: subcategory.name,
		products,
	};
}
