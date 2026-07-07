import 'server-only';

import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { cacheLife } from 'next/cache';
import { resolveAppLocale, isAppLocale, type AppLocale } from '@/constants/locales';
import { CLIENT_MESSAGE_NAMESPACES, loadLocaleMessages } from '@/i18n/messages';
import { buildLanguageAlternates, type AlternateSearchParams, absoluteUrl } from './seo';

// Server-only helpers. Kept in a separate module from `i18nUtils.ts` because
// `getLocalizedMetadata` uses `'use cache'`, and Next.js refuses to bundle any
// file containing an inline `'use cache'` annotation into the client bundle.
// Since `i18nUtils.ts` also exports `extractI18nData`, which _is_ used from
// client components (via constants/cart.ts → UserActions.tsx), splitting is
// the fix. The `server-only` import above turns any accidental client import
// of this module into a hard build error rather than a silent bundle bloat.

// Loads the client-visible slice of messages for a given locale. Reads the
// locale JSON bundles from disk via a dynamic import (mapped through
// `loadLocaleMessages`) instead of `getMessages` from `next-intl/server`.
// Under Cache Components, `getMessages` — even when passed an explicit
// `locale` — still touches next-intl's per-request context under the hood,
// which reads request headers and opts the whole calling tree out of
// prerendering. Reading the JSON directly makes this a pure function of
// (locale, namespaces) with no request-scoped data flowing through it.
export async function loadClientMessages(
	locale: string,
	namespaces: readonly string[] = CLIENT_MESSAGE_NAMESPACES,
) {
	'use cache';
	cacheLife('days');

	const resolvedLocale: AppLocale = isAppLocale(locale) ? locale : resolveAppLocale(locale);
	const messages = (await loadLocaleMessages(resolvedLocale)) as Record<string, unknown>;

	return namespaces.reduce<Record<string, unknown>>((acc, ns) => {
		acc[ns] = messages[ns] ?? {};
		return acc;
	}, {});
}

export async function getLocalizedMetadata(
	locale: string,
	pageKey: string,
	options?: {
		pathname?: string;
		searchParams?: AlternateSearchParams;
		robots?: Metadata['robots'];
	},
): Promise<Metadata> {
	// Called from every page's `generateMetadata` on every request. The
	// per-locale translations + hardcoded URLs never change between deploys,
	// so let Next.js reuse the assembled Metadata object.
	'use cache';
	cacheLife('days');

	const pagesT = await getTranslations({ locale, namespace: 'pages' });

	const title = pagesT(`metadata.${pageKey}.title`);
	const description = pagesT(`metadata.${pageKey}.description`);
	const defaultOgImage = absoluteUrl('/assets/images/logoBig.webp');

	const alternates =
		options?.pathname && locale
			? buildLanguageAlternates(
					resolveAppLocale(locale),
					options.pathname,
					options?.searchParams ?? undefined,
				)
			: undefined;

	return {
		title,
		description,
		...(alternates && { alternates }),
		robots: options?.robots ?? { index: true, follow: true },
		openGraph: {
			title,
			description,
			type: 'website',
			url: alternates?.canonical,
			images: [defaultOgImage],
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			images: [defaultOgImage],
		},
	};
}
