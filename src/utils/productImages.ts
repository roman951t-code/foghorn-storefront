export function buildProductImages(imageUrl?: string | null, count = 4): string[] {
	if (!imageUrl) return [];

	try {
		const url = new URL(imageUrl);

		// Normalize loremflickr URLs to square dimensions
		if (url.hostname.includes('loremflickr.com')) {
			const segments = url.pathname.split('/').filter(Boolean);
			if (segments.length >= 2 && /^\d+$/.test(segments[0]) && /^\d+$/.test(segments[1])) {
				segments[0] = '900';
				segments[1] = '900';
				url.pathname = '/' + segments.join('/');
			}
		}

		return Array.from({ length: count }).map((_, idx) => {
			const clone = new URL(url.toString());
			clone.searchParams.set('lock', String(idx + 1));
			return clone.toString();
		});
	} catch {
		return [imageUrl];
	}
}

export function toPreviewImage(src: string): string {
	try {
		const url = new URL(src);
		if (url.hostname.includes('loremflickr.com')) {
			const segments = url.pathname.split('/').filter(Boolean);
			if (segments.length >= 2 && /^\d+$/.test(segments[0]) && /^\d+$/.test(segments[1])) {
				segments[0] = '400';
				segments[1] = '400';
				url.pathname = '/' + segments.join('/');
			}
		}
		return url.toString();
	} catch {
		return src;
	}
}
