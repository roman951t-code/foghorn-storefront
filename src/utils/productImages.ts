const SQUARE_FULL = 1100;
// Card thumbnails render up to PRODUCTS_GRID_CARD_MAX_WIDTH_PX (src/constants/grids.ts)
// wide; on a 2x/retina screen that needs a source at least double that or it
// visibly upscales/blurs.
const SQUARE_PREVIEW = 540;
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
	return trimmed.length > 0 ? trimmed : null;
};

const updatePicsumPath = (url: URL, size: number, suffix?: string) => {
	const segments = url.pathname.split('/').filter(Boolean);
	const seedIndex = segments.findIndex((segment) => segment === 'seed');
	if (seedIndex !== -1 && segments.length >= seedIndex + 3) {
		const baseSeed = segments[seedIndex + 1] ?? 'product';
		segments[seedIndex + 1] = suffix ? `${baseSeed}-${suffix}` : baseSeed;
		segments[seedIndex + 2] = String(size);
		segments[seedIndex + 3] = String(size);
		url.pathname = '/' + segments.join('/');
		url.search = '';
	}
};

const updateLoremFlickrPath = (url: URL, size: number) => {
	const segments = url.pathname.split('/').filter(Boolean);
	if (segments.length >= 2 && /^\d+$/.test(segments[0]) && /^\d+$/.test(segments[1])) {
		segments[0] = String(size);
		segments[1] = String(size);
		url.pathname = '/' + segments.join('/');
	}
};

function buildProductImages(imageUrl?: string | null, count = 4): string[] {
	const normalizedImageUrl = normalizeImageUrl(imageUrl);
	if (!normalizedImageUrl) return [];

	try {
		const baseUrl = new URL(normalizedImageUrl);
		const isPicsum = baseUrl.hostname.includes('picsum.photos');
		const isLorem = baseUrl.hostname.includes('loremflickr.com');

		return Array.from({ length: count }).map((_, idx) => {
			const clone = new URL(baseUrl.toString());
			if (isPicsum) {
				updatePicsumPath(clone, SQUARE_FULL, String(idx + 1));
			} else if (isLorem) {
				updateLoremFlickrPath(clone, SQUARE_FULL);
				clone.searchParams.set('lock', String(idx + 1));
			} else {
				clone.searchParams.set('variant', String(idx + 1));
			}
			return clone.toString();
		});
	} catch {
		return [normalizedImageUrl];
	}
}

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
		return [primaryImage, ...normalizedImages.filter((image) => image !== primaryImage)];
	}

	if (count <= 1) {
		return [primaryImage];
	}

	const generatedImages = buildProductImages(primaryImage, count - 1);

	return [primaryImage, ...generatedImages.filter((image) => image !== primaryImage)];
}

export function toPreviewImage(src: string): string {
	try {
		const url = new URL(src);
		if (url.hostname.includes('picsum.photos')) {
			updatePicsumPath(url, SQUARE_PREVIEW);
		} else if (url.hostname.includes('loremflickr.com')) {
			updateLoremFlickrPath(url, SQUARE_PREVIEW);
		}
		return url.toString();
	} catch {
		return src;
	}
}
