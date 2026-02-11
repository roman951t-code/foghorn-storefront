import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { absoluteUrl, localizePath } from '@/utils/seo';
import type { AppLocale } from '@/constants/locales';
import { getCatalog } from '@/actions/products/getCatalog';
import { SITEMAP_STATIC_PATHS } from '@/constants/sitemap';
import { prisma } from '@/lib/prisma';
import { getPublishedProductWhere } from '@/utils/publishSchedule';
import { pickLocalizedTranslation } from '@/utils/localeFallback';

const normalizeProductFullSlug = (fullSlug: string) => fullSlug.replace(/^\/+/, '');

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
	let productEntries: MetadataRoute.Sitemap = [];

	const [catalogResult, productsResult] = await Promise.allSettled([
		getCatalog(),
		prisma.product.findMany({
			where: { AND: [getPublishedProductWhere(now)] },
			select: {
				fullSlug: true,
				updatedAt: true,
				translations: {
					where: { locale: { in: locales } },
					select: { locale: true, fullSlug: true },
					orderBy: { updatedAt: 'desc' },
				},
			},
			orderBy: { updatedAt: 'desc' },
		}),
	]);

	if (catalogResult.status === 'fulfilled') {
		catalogEntries = catalogResult.value.catalog.flatMap((category) =>
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
	} else {
		console.error('Sitemap catalog error:', catalogResult.reason);
	}

	if (productsResult.status === 'fulfilled') {
		productEntries = productsResult.value.flatMap((product) =>
			locales
				.map((locale) => {
					const translation = pickLocalizedTranslation(product.translations, locale);
					const fullSlug = translation?.fullSlug ?? product.fullSlug;
					if (!fullSlug) return null;

					const normalizedFullSlug = normalizeProductFullSlug(fullSlug);
					if (!normalizedFullSlug) return null;

					return {
						url: absoluteUrl(localizePath(locale, `/products/${normalizedFullSlug}`)),
						lastModified: product.updatedAt,
						changeFrequency: 'daily' as const,
						priority: 0.8,
					};
				})
				.filter((entry): entry is NonNullable<typeof entry> => entry !== null)
		);
	} else {
		console.error('Sitemap products error:', productsResult.reason);
	}

	return [...baseEntries, ...catalogEntries, ...productEntries];
}
