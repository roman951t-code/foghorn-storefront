import { prisma } from '@/lib/prisma';
import { Product } from '@/types/product';

export async function getProductsBySearchQuery(
	searchQuery: string,
	limit: number = 12,
	offset: number = 0
): Promise<{
	products: Product[];
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

	// Fetch only paginated product data
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
			slug: true,
			imageUrl: true,
			basePrice: true,
			discountPrice: true,
			inStock: true,
			reviews: {
				select: { rating: true },
			},
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

	const productItems: Product[] = products.map((product) => {
		const ratings = product.reviews.map((r) => r.rating);
		const averageRating =
			ratings.length > 0 ? ratings.reduce((sum, val) => sum + val, 0) / ratings.length : 0;

		return {
			id: product.id,
			name: product.name,
			slug: product.slug,
			category: product.category.parent?.slug || '',
			subcategory: product.category.slug,
			imageUrl: product.imageUrl ?? '',
			inStock: product.inStock,
			basePrice: Number(product.basePrice),
			discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
			averageRating,
			reviewCount: product.reviews.length,
		};
	});

	return {
		products: productItems,
		totalCount,
		subcategories: Array.from(uniqueSubcategoriesMap.values()),
	};
}
