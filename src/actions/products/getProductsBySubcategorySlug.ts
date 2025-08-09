import { prisma } from '@/lib/prisma';
import { Product } from '@/types/product';

export async function getProductsBySubcategorySlug(
	slug: string,
	limit = 12,
	offset = 0,
	onlyInStock?: boolean
): Promise<{
	categoryName: string;
	subcategoryName: string;
	products: Product[];
	totalCount: number;
}> {
	const subcategory = await prisma.productCategory.findUnique({
		where: { slug },
		include: { parent: true },
	});

	if (!subcategory) {
		return {
			categoryName: '',
			subcategoryName: '',
			products: [],
			totalCount: 0,
		};
	}

	const paginatedProducts = await prisma.product.findMany({
		where: {
			category: { slug },
			...(onlyInStock ? { inStock: true } : {}),
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
			reviews: { select: { rating: true } },
			tags: true,
		},
	});

	const totalCount = await prisma.product.count({
		where: {
			category: { slug },
			...(onlyInStock ? { inStock: true } : {}),
		},
	});

	const tagPriority = ['popular', 'new', 'discount', 'promotional'];

	const sortedProducts = paginatedProducts.sort((a, b) => {
		const aScore = Math.min(
			...tagPriority.map((tag, i) => (a.tags?.includes(tag) ? i : tagPriority.length))
		);
		const bScore = Math.min(
			...tagPriority.map((tag, i) => (b.tags?.includes(tag) ? i : tagPriority.length))
		);
		return aScore - bScore;
	});

	const products: Product[] = sortedProducts.map((product) => {
		const ratings = product.reviews.map((r) => r.rating);
		const averageRating =
			ratings.length > 0
				? ratings.reduce((sum: number, val: number) => sum + val, 0) / ratings.length
				: 0;

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
		totalCount,
	};
}
