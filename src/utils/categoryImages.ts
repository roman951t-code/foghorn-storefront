const normalizeImageUrl = (value?: string | null): string | null => {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
};

const toCssUrlLayer = (value: string) => `url("${value.replace(/"/g, '%22')}")`;

export const CATEGORY_PLACEHOLDER_IMAGE = '/assets/images/category-placeholder.svg';
export const SUBCATEGORY_PLACEHOLDER_IMAGE = '/assets/images/subcategory-placeholder.svg';

export const resolveCategoryImage = (imageUrl?: string | null): string =>
	normalizeImageUrl(imageUrl) ?? CATEGORY_PLACEHOLDER_IMAGE;

export const resolveSubcategoryImage = (
	imageUrl?: string | null,
	fallbackImageUrl?: string | null
): string =>
	normalizeImageUrl(imageUrl) ??
	normalizeImageUrl(fallbackImageUrl) ??
	SUBCATEGORY_PLACEHOLDER_IMAGE;

export const buildImageBackgroundWithFallback = (
	imageUrl: string | null | undefined,
	fallbackImageUrl: string
) => {
	const primary = normalizeImageUrl(imageUrl);
	const fallback = normalizeImageUrl(fallbackImageUrl) ?? fallbackImageUrl;

	if (!primary || primary === fallback) return toCssUrlLayer(fallback);
	return `${toCssUrlLayer(primary)}, ${toCssUrlLayer(fallback)}`;
};
