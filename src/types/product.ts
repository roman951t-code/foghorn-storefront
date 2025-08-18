import { getCatalog } from '@/actions/products/getCatalog';
import { getProductBySlug } from '@/actions/products/getProductBySlug';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// type ReplaceDecimalWithString<T> = T extends Decimal
// 	? number
// 	: T extends Array<infer U>
// 		? Array<ReplaceDecimalWithString<U>>
// 		: T extends object
// 			? { [K in keyof T]: ReplaceDecimalWithString<T[K]> }
// 			: T;

// type ProductBase = Prisma.ProductGetPayload<{
// 	include: {
// 		category: true;
// 	};
// }>;

// export type Product = ReplaceDecimalWithString<ProductBase>;

// export type ProductSummary = ProductPick<'id' | 'name' | 'basePrice'>;

export type Product = Awaited<ReturnType<typeof getProductBySlug>>;

export type CategoryWithSubcategories = Awaited<ReturnType<typeof getCatalog>>;

export type CatalogCategory = CategoryWithSubcategories['catalog'][number];

export type ProductPick<K extends keyof Product> = Pick<Product, K>;

export type SubcategoryProduct = Partial<{
	name: string;
	id: string;
	reviews: {
		rating: number;
	}[];
	categoryName: string;
	subcategoryName: string;
	imageUrl: string | null;
	basePrice: number;
	discountPrice: number | null;
	inStock: boolean;
	tags: string[];
	fullSlug: string;
	averageRating: number;
	reviewCount: number;
}>;

export type SearchProductItem = {
	type: 'product';
	name: string;
	product: string;
	category: string;
	subcategory: string;
};

export type SearchSubcategoryItem = {
	type: 'subcategory';
	name: string;
	subcategory: string;
	category: string;
};

export type SubcategoryInfo = {
	categoryName: string;
	categorySlug: string;
	subcategoryName: string;
	subcategorySlug: string;
};

export type ProductsOnly = { products: SubcategoryProduct[] };

export type ProductsWithMeta = {
	products: SubcategoryProduct[];
	totalCount: number;
	subcategories: SubcategoryInfo[];
};
