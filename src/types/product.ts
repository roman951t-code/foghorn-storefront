export type Category = {
	id: string;
	name: string;
	slug: string;
	children: {
		id: string;
		name: string;
		slug: string;
	}[];
};

export type ProductAttribute = {
	name: string;
	unit?: string | null;
	value: string;
};

export type ProductReviewUser = {
	name: string;
	image?: string | null;
};

export type ProductReview = {
	rating: number;
	comment: string;
	createdAt: string | Date;
	user: ProductReviewUser;
};

export type Product = {
	id: string;
	name: string;
	slug: string;
	category?: string;
	subcategory?: string;
	imageUrl: string | null;
	basePrice: number;
	discountPrice: number | null;
	averageRating: number;
	productCode?: string;
	reviewCount: number;
	inStock: boolean;
	attributes?: ProductAttribute[];
	reviews?: ProductReview[];
};

export type SubcategoryWithProducts = {
	id: string;
	name: string;
	slug: string;
	products: Product[];
};

export type CategoryWithSubcategories = {
	id: string;
	name: string;
	slug: string;
	children: SubcategoryWithProducts[];
};

export type CatalogCategory = {
	id: string;
	name: string;
	slug: string;
	children: SubcategoryWithProducts[];
};

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
