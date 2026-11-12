// Demo photos are bundled with the storefront: no runtime image-provider calls.
export const DEMO_IMAGES = [
	'/products/demo/tech-desk.webp',
	'/products/demo/audio-desk.webp',
	'/products/demo/camera-desk.webp',
] as const;

export function isLegacyDemoImage(src: string): boolean {
	try {
		const { hostname } = new URL(src);
		return ['picsum.photos', 'loremflickr.com'].some(
			(host) => hostname === host || hostname.endsWith(`.${host}`),
		);
	} catch {
		return false;
	}
}

export function getDemoImage(seed: string): string {
	let hash = 0;
	for (const char of seed) hash = (Math.imul(hash, 31) + char.charCodeAt(0)) >>> 0;
	return DEMO_IMAGES[hash % DEMO_IMAGES.length];
}

// Resolve old persisted URLs at read time so deployment needs no database reseed.
// Custom uploads and other external providers retain their original URL/signature.
export function resolveDemoImage(src: string): string {
	if (!isLegacyDemoImage(src)) return src;
	const url = new URL(src);
	const segments = url.pathname.split('/').filter(Boolean);
	const seedIndex = segments.indexOf('seed');
	return getDemoImage(seedIndex >= 0 ? segments[seedIndex + 1] ?? src : url.pathname);
}

export function getDemoGallery(src: string, count: number): string[] {
	const primary = resolveDemoImage(src);
	const index = DEMO_IMAGES.findIndex((image) => image === primary);
	if (index < 0) return [primary];
	return Array.from({ length: Math.min(Math.max(1, count), DEMO_IMAGES.length) }, (_, offset) =>
		DEMO_IMAGES[(index + offset) % DEMO_IMAGES.length],
	);
}

export function isBundledDemoImage(src: string): boolean {
	return DEMO_IMAGES.some((image) => src === image || src === image.replace('.webp', '-preview.webp'));
}
