import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

type ReplaceDecimalWithString<T> = T extends Decimal
	? number
	: T extends Array<infer U>
		? Array<ReplaceDecimalWithString<U>>
		: T extends object
			? { [K in keyof T]: ReplaceDecimalWithString<T[K]> }
			: T;

type ProductBase = Prisma.ProductGetPayload<{
	include: {
		category: true;
	};
}>;

export type Product = ReplaceDecimalWithString<ProductBase>;

export type ProductPick<K extends keyof Product> = Pick<Product, K>;

export type ProductSummary = ProductPick<'id' | 'name' | 'basePrice'>;

export type SubcategoryProduct = Partial<Product> & { averageRating: number; reviewCount: number };

export type CategoryWithSubcategories =
	| ({
			children: {
				name: string;
				id: string;
				slug: string;
				products: {
					name: string;
					id: string;
					fullSlug: string;
				}[];
			}[];
	  } & {
			name: string;
			id: string;
			slug: string;
			parentId: string | null;
	  })
	| undefined;

export type CatalogCategory = {
	children: {
		name: string;
		id: string;
		slug: string;
		products: {
			name: string;
			id: string;
			slug: string;
		}[];
	}[];
} & {
	name: string;
	id: string;
	slug: string;
	parentId: string | null;
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

export type SubcategoryInfo = {
	categoryName: string;
	categorySlug: string;
	subcategoryName: string;
	subcategorySlug: string;
};

export type ProductsOnly = { products: Product[] };

export type ProductsWithMeta = {
	products: TaggedProduct[];
	totalCount: number;
	subcategories: SubcategoryInfo[];
};

type ProductDetailBase = Prisma.ProductGetPayload<{
	select: {
		id: true;
		name: true;
		fullSlug: true;
		slug: true;
		imageUrl: true;
		basePrice: true;
		discountPrice: true;
		productCode: true;
		inStock: true;
		averageRating: true;
		reviewCount: true;
		categoryName: true;
		subcategoryName: true;
		attributes: {
			select: {
				attribute: { select: { name: true; unit: true } };
				value: true;
			};
		};
		reviews: {
			select: {
				rating: true;
				comment: true;
				createdAt: true;
				user: { select: { name: true; image: true } };
			};
			orderBy: { createdAt: 'desc' };
		};
	};
}>;

export type ProductDetail = Omit<ReplaceDecimalWithString<ProductDetailBase>, 'attributes'> & {
	attributes: { name: string; unit: string | null; value: string }[];
	reviews: {
		rating: number;
		comment: string;
		createdAt: Date;
		user: { name: string; image?: string | null };
	}[];
};
