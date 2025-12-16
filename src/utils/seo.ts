import { LOCALE_TO_HTML_LANG, type AppLocale } from '@/constants/locales';
import { routing } from '@/i18n/routing';

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export type AlternateSearchParams = Record<string, string | string[] | null | undefined>;

const normalizePathname = (pathname: string) => {
	if (!pathname || pathname === '/') return '';
	return pathname.startsWith('/') ? pathname : `/${pathname}`;
};

const buildQueryString = (searchParams?: AlternateSearchParams) => {
	if (!searchParams) return '';

	const query = new URLSearchParams();

	for (const [key, value] of Object.entries(searchParams)) {
		if (value === undefined || value === null) continue;

		if (Array.isArray(value)) {
			value.forEach((entry) => query.append(key, entry));
		} else {
			query.append(key, value);
		}
	}

	const search = query.toString();
	return search ? `?${search}` : '';
};

const withLocalePrefix = (locale: AppLocale, normalizedPath: string) => {
	if (!normalizedPath) {
		return locale === routing.defaultLocale ? '/' : `/${locale}`;
	}

	return locale === routing.defaultLocale ? normalizedPath : `/${locale}${normalizedPath}`;
};

export const localizePath = (locale: AppLocale, pathname: string) =>
	withLocalePrefix(locale, normalizePathname(pathname));

export const absoluteUrl = (pathWithQuery: string) => new URL(pathWithQuery, APP_URL).toString();

export const toHrefLang = (locale: AppLocale) => LOCALE_TO_HTML_LANG[locale] ?? locale;

export function buildLanguageAlternates(
	locale: AppLocale,
	pathname: string,
	searchParams?: AlternateSearchParams
) {
	const normalizedPath = normalizePathname(pathname);
	const query = buildQueryString(searchParams);

	const languages = routing.locales.reduce<Record<string, string>>((acc, localeCode) => {
		const hrefLang = toHrefLang(localeCode as AppLocale);
		const pathWithLocale = withLocalePrefix(localeCode as AppLocale, normalizedPath);

		acc[hrefLang] = absoluteUrl(`${pathWithLocale}${query}`);
		return acc;
	}, {});

	const defaultLocale = routing.defaultLocale as AppLocale;
	const defaultPath = withLocalePrefix(defaultLocale, normalizedPath);
	languages['x-default'] = absoluteUrl(`${defaultPath}${query}`);

	const canonicalPath = withLocalePrefix(locale, normalizedPath);

	return {
		canonical: absoluteUrl(`${canonicalPath}${query}`),
		languages,
	};
}
