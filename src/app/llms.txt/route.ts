import { APP_URL } from '@/utils/seo';
import { SITEMAP_STATIC_PATHS } from '@/constants/sitemap';
import { SITE_NAME } from '@/constants/site';

export function GET() {
	const lines = [
		`# ${SITE_NAME} — Ecommerce Storefront`,
		'',
		'> Electronics, home goods, and everyday essentials, with catalog browsing, search, cart, wishlist, product reviews, and checkout.',
		'',
		'This is a real, browsable storefront (not a mockup) — content, prices, and stock levels are demo/seed data, and checkout runs in a safe order-simulation mode with no real charges.',
		'',
		'## Key pages',
		'',
		`- [Home](${APP_URL}/): catalog navigation, featured products and categories.`,
		'- Product catalog: /products/{category}, /products/{category}/{subcategory}, and individual product pages under those — browsable without an account.',
		'- Search: /products/search?searchQuery=... — matches product names and descriptions.',
		...SITEMAP_STATIC_PATHS.filter((entry) => entry.path !== '/').map(
			(entry) => `- [${entry.path.slice(1).replace(/-/g, ' ')}](${APP_URL}${entry.path}): static info page.`,
		),
		'- Account cabinet (/cabinet/*) and checkout (/checkout) require a signed-in session — sign up via email/OTP, phone/OTP, or Google.',
		'',
		'## Languages',
		'',
		'Ukrainian (default, no path prefix) and English (/en prefix). Every page above exists in both locales.',
		'',
		'## For automated agents',
		'',
		"Read-only browsing of catalog and info pages is welcome. Machine-readable structured data (JSON-LD Product/Breadcrumb) is present on catalog and product pages. Do not attempt to place real orders or exercise authentication flows meant for humans — /api/* and authenticated sections are excluded in robots.txt.",
		'',
		`Sitemap: ${APP_URL}/sitemap.xml`,
		'',
	];

	return new Response(lines.join('\n'), {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
		},
	});
}
