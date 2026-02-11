import type { MetadataRoute } from 'next';
import { APP_URL } from '@/utils/seo';
import { routing } from '@/i18n/routing';

export default function robots(): MetadataRoute.Robots {
	const restrictedSections = ['/cabinet', '/checkout'] as const;
	const localizedRestrictions = routing.locales.flatMap((locale) =>
		restrictedSections.map((section) =>
			locale === routing.defaultLocale ? section : `/${locale}${section}`
		)
	);

	return {
		rules: [
			{
				userAgent: '*',
				allow: '/',
				disallow: ['/api', ...new Set(localizedRestrictions)],
			},
		],
		sitemap: `${APP_URL}/sitemap.xml`,
		host: APP_URL,
	};
}
