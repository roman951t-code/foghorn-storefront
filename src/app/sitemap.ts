import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { absoluteUrl, localizePath } from '@/utils/seo';
import type { AppLocale } from '@/constants/locales';
import { getCatalog } from '@/actions/products/getCatalog';
import { SITEMAP_STATIC_PATHS } from '@/constants/sitemap';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const now = new Date();
	const locales = [...routing.locales] as AppLocale[];

	const baseEntries = locales.flatMap((locale) =>
		SITEMAP_STATIC_PATHS.map(({ path, priority }) => ({
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
