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
