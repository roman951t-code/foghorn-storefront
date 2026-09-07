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
	const disallow = ['/api', ...new Set(localizedRestrictions)];

	return {
		rules: [
			{
				userAgent: '*',
				allow: '/',
				disallow,
			},
			{
				// Explicit allow for known AI crawlers/agents (catalog QA tools, chat
				// assistants doing live browsing, LLM training crawlers) — the
				// wildcard rule above already permits them, but naming them keeps
				// intent unambiguous if a host/CDN layer ever special-cases unlisted
				// bots, and signals this storefront is meant to be agent-readable.
				userAgent: [
					'GPTBot',
					'ChatGPT-User',
					'OAI-SearchBot',
					'ClaudeBot',
					'anthropic-ai',
					'Claude-Web',
					'PerplexityBot',
					'Google-Extended',
					'Applebot-Extended',
				],
				allow: '/',
				disallow,
			},
		],
		sitemap: `${APP_URL}/sitemap.xml`,
		host: new URL(APP_URL).host,
	};
}
