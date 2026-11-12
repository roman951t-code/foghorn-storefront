import { getDemoGallery, resolveDemoImage, isBundledDemoImage } from './demoImages';

export const PRODUCT_PLACEHOLDER_IMAGE = '/assets/images/product-placeholder.svg';

const normalizeImageUrl = (value?: string | null): string | null => {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	if (trimmed.length === 0) return null;
	const lowered = trimmed.toLowerCase();
	if (
		lowered === 'null' ||
		lowered === 'undefined' ||
		lowered === 'none' ||
		lowered === 'n/a' ||
		lowered === 'na' ||
		lowered === '-'
	) {
		return null;
	}
	return resolveDemoImage(trimmed);
};

export const resolveProductPrimaryImage = (imageUrl?: string | null): string =>
	normalizeImageUrl(imageUrl) ?? PRODUCT_PLACEHOLDER_IMAGE;

export function resolveProductPrimaryImageFromGallery(
	imageUrl?: string | null,
	images?: Array<string | null | undefined>
): string {
	const galleryPrimary = (images ?? [])
		.map((image) => normalizeImageUrl(image))
		.find((image): image is string => Boolean(image));

	return resolveProductPrimaryImage(galleryPrimary ?? imageUrl);
}

export function buildProductImageGallery(
	imageUrl?: string | null,
	images?: Array<string | null | undefined>,
	count = 4
): string[] {
	const primaryImage = resolveProductPrimaryImageFromGallery(imageUrl, images);
	const normalizedImages = (images ?? [])
		.map((image) => normalizeImageUrl(image))
		.filter((image): image is string => Boolean(image));

	if (normalizedImages.length > 0) {
		return [...new Set([primaryImage, ...normalizedImages])];
	}

	if (count <= 1) {
		return [primaryImage];
	}

	const generatedImages = getDemoGallery(primaryImage, count);

	return [primaryImage, ...generatedImages.filter((image) => image !== primaryImage)];
}

export function toPreviewImage(src: string): string {
	const resolved = resolveDemoImage(src);
	return isBundledDemoImage(resolved) && !resolved.endsWith('-preview.webp')
		? resolved.replace('.webp', '-preview.webp')
		: resolved;
}
