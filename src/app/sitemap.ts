import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { absoluteUrl, localizePath } from '@/utils/seo';
import type { AppLocale } from '@/constants/locales';
import { getCatalog } from '@/actions/products/getCatalog';

const STATIC_PATHS = [
	{ path: '/', priority: 1 },
	{ path: '/about-us', priority: 0.6 },
	{ path: '/faq', priority: 0.6 },
	{ path: '/guarantee', priority: 0.6 },
	{ path: '/public-offer', priority: 0.6 },
	{ path: '/return-refund', priority: 0.6 },
	{ path: '/shipping-terms', priority: 0.6 },
	{ path: '/terms', priority: 0.6 },
	{ path: '/checkout', priority: 0.5 },
	{ path: '/cabinet', priority: 0.5 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const now = new Date();
	const locales = [...routing.locales] as AppLocale[];

	const baseEntries = locales.flatMap((locale) =>
		STATIC_PATHS.map(({ path, priority }) => ({
			url: absoluteUrl(localizePath(locale, path)),
			lastModified: now,
			changeFrequency: 'weekly' as const,
			priority,
		}))
	);

	let catalogEntries: MetadataRoute.Sitemap = [];
	try {
		const catalog = await getCatalog();
		catalogEntries = catalog.catalog.flatMap((category) =>
			locales.flatMap((locale) => {
				const categoryUrl = absoluteUrl(localizePath(locale, `/products/${category.slug}`));
				const subcategories = category.children?.map((child) => ({
					url: absoluteUrl(localizePath(locale, `/products/${category.slug}/${child.slug}`)),
					lastModified: now,
					changeFrequency: 'weekly' as const,
					priority: 0.6,
				}));

				return [
					{
						url: categoryUrl,
						lastModified: now,
						changeFrequency: 'weekly' as const,
						priority: 0.7,
					},
					...(subcategories ?? []),
				];
			})
		);
	} catch (error) {
		console.error('Sitemap catalog error:', error);
	}

	return [...baseEntries, ...catalogEntries];
}
