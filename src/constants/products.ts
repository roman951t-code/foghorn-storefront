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

export const WISHLIST_SORT_KEYS = ['new', 'expensiveToCheap', 'cheapToExpensive'] as const;

export const PRODUCT_TABS = ['about', 'characteristics', 'feedback'] as const;
export type ProductTabValue = (typeof PRODUCT_TABS)[number];
export const isProductTabValue = (value: string): value is ProductTabValue =>
	(PRODUCT_TABS as readonly string[]).includes(value);

export const WISHLIST_TAG_PRIORITY = ['popular', 'new', 'discount', 'promotional'] as const;
