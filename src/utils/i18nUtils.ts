import { useTranslations } from 'next-intl';
import { type Metadata } from 'next';
import { getMessages, getTranslations } from 'next-intl/server';
import { resolveAppLocale } from '@/constants/locales';
import { CLIENT_MESSAGE_NAMESPACES } from '@/i18n/messages';
import { buildLanguageAlternates, type AlternateSearchParams, absoluteUrl } from './seo';

export const extractI18nData = (
	t: ReturnType<typeof useTranslations>,
	keys: string[],
): { [key: string]: string } => Object.fromEntries(keys.map((key) => [key, t(key)]));

export async function loadClientMessages(
	namespaces: readonly string[] = CLIENT_MESSAGE_NAMESPACES,
) {
	const allMessages = await getMessages();
	const messages = allMessages as Record<string, unknown>;

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
