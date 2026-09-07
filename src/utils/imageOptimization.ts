const PICSUM_HOSTNAME = 'picsum.photos';

/**
 * Picsum is already serving appropriately sized seed images. While Vercel
 * image transformations are unavailable, load these URLs directly so a
 * transformation quota error cannot replace them with the UI fallback.
 */
export function shouldBypassImageOptimization(src: string): boolean {
	try {
		const hostname = new URL(src).hostname.toLowerCase();
		return hostname === PICSUM_HOSTNAME || hostname.endsWith(`.${PICSUM_HOSTNAME}`);
	} catch {
		return false;
	}
}
