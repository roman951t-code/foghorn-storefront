import { useTranslations } from 'next-intl';
import { type Metadata } from 'next';
import { getMessages, getTranslations } from 'next-intl/server';
import pick from 'lodash.pick';
import { routing } from '@/i18n/routing';
import type { AppLocale } from '@/constants/locales';
import { buildLanguageAlternates, type AlternateSearchParams } from './seo';

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
	const t = await getTranslations({ locale, namespace: 'pages' });

	const title = t(`metadata.${pageKey}.title`);
	const description = t(`metadata.${pageKey}.description`);

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
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
		},
	};
}
