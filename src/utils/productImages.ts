const SQUARE_FULL = 900;
const SQUARE_PREVIEW = 160;

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

export function buildProductImages(imageUrl?: string | null, count = 4): string[] {
	if (!imageUrl) return [];

	try {
		const baseUrl = new URL(imageUrl);
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
		return [imageUrl];
	}
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
