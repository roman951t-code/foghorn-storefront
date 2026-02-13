export const PRODUCTS_PER_PAGE = 16;
export const MAX_PRODUCTS_PER_PAGE = 50;

const toInteger = (value: string | undefined) => {
	if (typeof value !== 'string') return null;
	const parsed = Number.parseInt(value, 10);
	return Number.isFinite(parsed) ? parsed : null;
};

export const resolvePageParam = (rawPage: string | undefined) => {
	const page = toInteger(rawPage);
	if (page == null || page < 1) return 1;
	return page;
};

export const resolvePerPageParam = (rawPerPage: string | undefined) => {
	const perPage = toInteger(rawPerPage);
	if (perPage == null || perPage <= 0) return PRODUCTS_PER_PAGE;
	return Math.min(perPage, MAX_PRODUCTS_PER_PAGE);
};

export const resolveOffset = (page: number, pageSize: number) => Math.max(0, (page - 1) * pageSize);
