export const SUBCATEGORY_FILTER_EXCLUDED_KEYS: string[] = [
	'page',
	'perPage',
	'search',
	'min',
	'max',
	'inStock',
	'orderBy',
];

export const FILTER_TAG_EXCLUDED_KEYS: string[] = [
	'searchQuery',
	'tag',
	'page',
	'perPage',
	'min',
	'max',
	'inStock',
	'orderBy',
];

const PRODUCT_TABS = ['about', 'characteristics', 'feedback'] as const;
export type ProductTabValue = (typeof PRODUCT_TABS)[number];
export const isProductTabValue = (value: string): value is ProductTabValue =>
	(PRODUCT_TABS as readonly string[]).includes(value);

export const WISHLIST_TAG_PRIORITY = ['popular', 'new', 'discount', 'promotional'] as const;

export const PRODUCT_LIST_CACHE_TAG = 'products';
export const PRODUCT_DETAIL_CACHE_TAG = 'product-by-slug';
export const PRODUCT_CATEGORY_CACHE_TAG = 'product-categories';
export const PRODUCT_FILTERS_CACHE_TAG = 'product-filters';
export const PRODUCT_CATALOG_CACHE_TAG = 'product-catalog';

export const productCacheTagById = (productId: string) => `product:${productId}`;
