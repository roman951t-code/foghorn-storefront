import { prisma } from '@/lib/prisma';
import { SubcategoryProduct } from '@/types/product';

export async function getProductsBySearchQuery(
	searchQuery: string,
	limit: number = 12,
	offset: number = 0
): Promise<{
	products: SubcategoryProduct[];
	totalCount: number;
	subcategories: {
		categoryName: string;
		categorySlug: string;
		subcategoryName: string;
		subcategorySlug: string;
	}[];
}> {
	const allMatchingProducts = await prisma.product.findMany({
		where: {
			name: { contains: searchQuery, mode: 'insensitive' },
		},
		select: {
			category: {
				select: {
					slug: true,
					name: true,
					parent: {
						select: {
							slug: true,
							name: true,
						},
					},
				},
			},
		},
	});

	const totalCount = allMatchingProducts.length;

	const uniqueSubcategoriesMap = new Map<
		string,
		{
			categoryName: string;
			categorySlug: string;
			subcategoryName: string;
			subcategorySlug: string;
		}
	>();

	for (const p of allMatchingProducts) {
		const subcategorySlug = p.category.slug;
		if (!uniqueSubcategoriesMap.has(subcategorySlug)) {
			uniqueSubcategoriesMap.set(subcategorySlug, {
				categoryName: p.category.parent?.name || '',
				categorySlug: p.category.parent?.slug || '',
				subcategoryName: p.category.name,
				subcategorySlug: p.category.slug,
			});
		}
	}

	const products = await prisma.product.findMany({
		where: {
			name: { contains: searchQuery, mode: 'insensitive' },
		},
		orderBy: [{ inStock: 'desc' }, { name: 'asc' }],
		skip: offset,
		take: limit,
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
	});

	const productItems: SubcategoryProduct[] = products.map((product) => {
		const ratings = product.reviews.map((r) => r.rating);
		const averageRating =
			ratings.length > 0 ? ratings.reduce((sum, val) => sum + val, 0) / ratings.length : 0;

		return {
			...product,
			basePrice: Number(product.basePrice),
			discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
			averageRating,
			reviewCount: product.reviews.length,
		} as SubcategoryProduct;
	});

	return {
		products: productItems,
		totalCount,
		subcategories: Array.from(uniqueSubcategoriesMap.values()),
	};
}
