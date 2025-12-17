'use server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import {
	ProductsOnly,
	ProductsWithMeta,
	SubcategoryInfo,
	SubcategoryProduct,
} from '@/types/product';
import { buildProductImages } from '@/utils/productImages';

export async function getProductsByTag<T extends boolean>(
	tag: string,
	fetchAll: T = false as T,
	limit = 12,
	offset = 0,
	minPrice?: number,
	maxPrice?: number,
	inStock?: boolean,
	orderBy?: 'new' | 'expensive' | 'cheap',
	filters?: Record<string, string[]>
): Promise<T extends true ? ProductsWithMeta : ProductsOnly> {
	const priceFilter =
		minPrice !== undefined && maxPrice !== undefined
			? { gte: minPrice, lte: maxPrice }
			: minPrice !== undefined
				? { gte: minPrice }
				: maxPrice !== undefined
					? { lte: maxPrice }
					: undefined;

	const dynamicConditions = filters
		? Object.entries(filters).map(([key, values]) => ({
				attributes: {
					some: {
						attribute: { name: key },
						value: { in: values.flat() },
					},
				},
			}))
		: [];

		const whereClause: Prisma.ProductWhereInput = {
			tags: { has: tag },
			...(inStock !== undefined ? { inStock } : {}),
			...(priceFilter
			? {
					OR: [
						{ discountPrice: priceFilter },
						{ AND: [{ discountPrice: null }, { basePrice: priceFilter }] },
					],
				}
			: {}),
		...(dynamicConditions.length > 0 ? { AND: dynamicConditions } : {}),
	};

		const productsQuery = await prisma.product.findMany({
		where: whereClause,
		skip: fetchAll ? 0 : offset,
		take: fetchAll ? undefined : Math.min(limit, 10),
		select: {
			id: true,
			name: true,
			fullSlug: true,
			imageUrl: true,
			basePrice: true,
			discountPrice: true,
			inStock: true,
			reviews: { select: { rating: true } },
			createdAt: true,
		},
	});

	const productsWithPrice = productsQuery.map((p) => {
		const basePrice = Number(p.basePrice ?? 0);
		const discountPrice = p.discountPrice != null ? Number(p.discountPrice) : null;
		return {
			...p,
			basePrice,
			discountPrice,
			effectivePrice: Number(discountPrice ?? basePrice ?? 0),
		};
	});

	let sortedProducts = [...productsWithPrice];
	if (orderBy === 'new') {
		sortedProducts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
	} else if (orderBy === 'expensive') {
		sortedProducts.sort((a, b) => b.effectivePrice - a.effectivePrice);
	} else if (orderBy === 'cheap') {
		sortedProducts.sort((a, b) => a.effectivePrice - b.effectivePrice);
	} else {
		sortedProducts.sort((a, b) => {
			if (a.inStock !== b.inStock) return a.inStock ? -1 : 1;
			return a.name.localeCompare(b.name);
		});
	}

	const products: SubcategoryProduct[] = sortedProducts.map((product) => {
		const ratings = product.reviews?.map((r) => r.rating) ?? [];
		const averageRating = ratings.length
			? ratings.reduce((sum, val) => sum + val, 0) / ratings.length
			: 0;

		return {
			...product,
			id: product.id ?? '',
			name: product.name ?? '',
			fullSlug: product.fullSlug ?? '',
			imageUrl: product.imageUrl ?? null,
			images: buildProductImages(product.imageUrl ?? undefined, 4),
			inStock: !!product.inStock,
			basePrice: Number(product.basePrice ?? 0),
			discountPrice: product.discountPrice != null ? Number(product.discountPrice) : null,
			averageRating,
			reviewCount: product.reviews?.length ?? 0,
		} as SubcategoryProduct;
	});

	const maxProductPrice = products.reduce(
		(max, p) => Math.max(max, p.discountPrice ?? p.basePrice ?? 0),
		0
	);

	if (!fetchAll) {
		return { products, maxProductPrice } as T extends true ? ProductsWithMeta : ProductsOnly;
	}

	const allMatchingProducts = await prisma.product.findMany({
		where: whereClause,
		select: {
			category: {
				select: {
					slug: true,
					name: true,
					parent: {
						select: { slug: true, name: true },
					},
				},
			},
		},
	});

	const totalCount = allMatchingProducts.length;

	const uniqueSubcategoriesMap = new Map<string, SubcategoryInfo>();
	for (const p of allMatchingProducts) {
		const category = p.category;
		if (!category?.slug) continue;
		const subcategorySlug = category.slug;
		if (!uniqueSubcategoriesMap.has(subcategorySlug)) {
			uniqueSubcategoriesMap.set(subcategorySlug, {
				categoryName: category.parent?.name || '',
				categorySlug: category.parent?.slug || '',
				subcategoryName: category.name || '',
				subcategorySlug,
			});
		}
	}

	return {
		products,
		totalCount,
		subcategories: Array.from(uniqueSubcategoriesMap.values()),
		maxProductPrice,
	} as T extends true ? ProductsWithMeta : ProductsOnly;
}
