import type { MetadataRoute } from 'next';

// Rendered as /manifest.webmanifest. Referenced automatically by Next.js's
// metadata layer, so no extra <link rel="manifest"> tag needed. Values kept
// deliberately conservative (no scope claim, no service-worker install) —
// this is here for SEO/PWA-hint completeness (Lighthouse "Installable" audit,
// Android/iOS Add-to-Home-Screen labelling), not to declare a full PWA.
//
// Two spec gotchas that used to fire browser warnings here:
//  1. `id` must be same-origin as the document. Using APP_URL breaks the
//     manifest on any preview / localhost origin. A relative `id: '/'`
//     resolves against the current origin on every environment.
//  2. `sizes: '192x192'` requires the underlying image to *actually* be
//     192×192 or the browser rejects the icon ("Resource size is not
//     correct"). The existing logo assets aren't exact power-of-two sizes,
//     so declaring `sizes: 'any'` (valid per spec, means "scalable / any
//     size") lets browsers use them as-is.
export default function manifest(): MetadataRoute.Manifest {
	return {
		name: 'Online Store',
		short_name: 'Online Store',
		description:
			'Shop electronics, home goods, and everyday essentials online with secure checkout and fast delivery.',
		start_url: '/',
		id: '/',
		display: 'standalone',
		background_color: '#0a0f1f',
		theme_color: '#0a0f1f',
		orientation: 'portrait',
		icons: [
			{
				src: '/favicon.svg',
				sizes: 'any',
				type: 'image/svg+xml',
				purpose: 'any',
			},
			{
				src: '/apple-touch-icon.png',
				sizes: '180x180',
				type: 'image/png',
				purpose: 'any',
			},
		],
	};
}
