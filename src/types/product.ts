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

export type Product = {
	id: string;
	name: string;
	slug: string;
	imageUrl: string | null;
	basePrice: number;
	discountPrice: number | null;
	averageRating: number;
	productCode: string;
	reviewCount: number;
	inStock: boolean;
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
