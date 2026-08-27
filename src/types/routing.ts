import type { AppLocale } from '@/constants/locales';

type BaseParams<T extends Record<string, string>> = {
	params: T;
};

export type LocaleParam = { locale: AppLocale };
type CategoryParam = LocaleParam & { category: string };
type SubcategoryParam = CategoryParam & { subcategory: string };
type ProductParam = SubcategoryParam & { product: string };

export type LocaleParams = BaseParams<LocaleParam>;
export type CategoryParams = BaseParams<CategoryParam>;
export type SubcategoryParams = BaseParams<SubcategoryParam>;
export type ProductParams = BaseParams<ProductParam>;

type BaseSearchParams = Record<string, string | undefined>;

type PaginatedSearchParams = BaseSearchParams & {
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
