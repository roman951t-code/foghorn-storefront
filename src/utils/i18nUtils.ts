import { useTranslations } from 'next-intl';
import { type Metadata } from 'next';
import { getMessages, getTranslations } from 'next-intl/server';
import pick from 'lodash.pick';
import { routing } from '@/i18n/routing';
import type { AppLocale } from '@/constants/locales';
import { buildLanguageAlternates, type AlternateSearchParams, absoluteUrl } from './seo';

export const extractI18nData = (
	t: ReturnType<typeof useTranslations>,
	keys: string[]
): { [key: string]: string } => Object.fromEntries(keys.map((key) => [key, t(key)]));

export async function loadClientMessages(namespaces: string[]) {
	const allMessages = await getMessages();

	// Ensure we always include requested namespaces, even if some are missing,
	// to avoid runtime "missing namespace" errors in client components.
	const picked = pick(allMessages, namespaces);
	return namespaces.reduce<Record<string, unknown>>((acc, ns) => {
		acc[ns] = picked?.[ns] ?? {};
		return acc;
	}, {});
}

const getSupportedLocale = (locale: string): AppLocale =>
	(routing.locales.includes(locale as AppLocale) ? locale : routing.defaultLocale) as AppLocale;

export async function getLocalizedMetadata(
	locale: string,
	pageKey: string,
	options?: { pathname?: string; searchParams?: AlternateSearchParams; robots?: Metadata['robots'] }
): Promise<Metadata> {
	const pagesT = await getTranslations({ locale, namespace: 'pages' });

	const title = pagesT(`metadata.${pageKey}.title`);
	const description = pagesT(`metadata.${pageKey}.description`);
	const defaultOgImage = absoluteUrl('/assets/images/logoBig.webp');

	const alternates =
		options?.pathname && locale
			? buildLanguageAlternates(
					getSupportedLocale(locale),
					options.pathname,
					options?.searchParams ?? undefined
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
