import { getCatalog } from '@/actions/products/getCatalog';
import { getProductBySlug } from '@/actions/products/getProductBySlug';

export type Product = Awaited<ReturnType<typeof getProductBySlug>>;

export type CategoryWithSubcategories = Awaited<ReturnType<typeof getCatalog>>;

export type CatalogCategory = CategoryWithSubcategories['catalog'][number];

export type ProductPick<K extends keyof Product> = Pick<Product, K>;

export type SubcategoryProduct = {
	id: string;
} & Partial<{
	name: string;
	reviews: { rating: number }[];
	categoryName: string;
	subcategoryName: string;
	imageUrl: string | null;
	images: string[];
	basePrice: number;
	discountPrice: number | null;
	inStock: boolean;
	tags: string[];
	fullSlug: string;
	averageRating: number;
	reviewCount: number;
	defaultVariant: {
		id: string;
		sku: string;
		price: number;
		stock: number;
		label: string;
	};
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

export type ProductsOnly = {
	products: SubcategoryProduct[];
	maxProductPrice: number;
};

export type ProductsWithMeta = {
	products: SubcategoryProduct[];
	totalCount: number;
	subcategories: SubcategoryInfo[];
	maxProductPrice: number;
};

export type Review = {
	id: string;
	rating: number;
	comment: string;
	advantages: string | null;
	disadvantages: string | null;
	createdAt: Date;
	user: { name: string; lastName: string | null; id: string };
};

export type FilterValue = {
	value: string;
	label: string;
};

export type Filter = {
	id: string;
	key: string;
	name: string;
	unit?: string | null;
	values: FilterValue[];
};
