import type { AppLocale } from '@/constants/locales';

type BaseParams<T extends Record<string, string>> = {
	params: T;
};

export type LocaleParam = { locale: AppLocale };
export type CategoryParam = LocaleParam & { category: string };
export type SubcategoryParam = CategoryParam & { subcategory: string };
export type ProductParam = SubcategoryParam & { product: string };

export type LocaleParams = BaseParams<LocaleParam>;
export type CategoryParams = BaseParams<CategoryParam>;
export type SubcategoryParams = BaseParams<SubcategoryParam>;
export type ProductParams = BaseParams<ProductParam>;

export type BaseSearchParams = Record<string, string | undefined>;

export type PaginatedSearchParams = BaseSearchParams & {
	page?: string;
	perPage?: string;
};

export type ProductFiltersSearchParams = PaginatedSearchParams & {
	search?: string;
	searchQuery?: string;
	tag?: string;
	min?: string;
	max?: string;
	inStock?: string;
	orderBy?: 'new' | 'expensive' | 'cheap';
};
