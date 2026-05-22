export const APP_LOCALES = ['uk', 'en'] as const;
export type AppLocale = (typeof APP_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = 'uk';

export const LANGUAGE_OPTIONS = [
	{ value: 'uk', label: 'Укр', flag: '🇺🇦' },
	{ value: 'en', label: 'Eng', flag: '🇺🇸' },
] as const satisfies readonly { value: AppLocale; label: string; flag: string }[];

export const LOCALE_SWITCHER_LABEL = 'Change language';

export const LOCALE_TO_INTL_MAP = {
	uk: 'uk-UA',
	en: 'en-US',
} as const satisfies Record<AppLocale, string>;

export const LOCALE_TO_HTML_LANG = {
	uk: 'uk',
	en: 'en-US',
} as const satisfies Record<AppLocale, string>;

export const isAppLocale = (locale: string | null | undefined): locale is AppLocale =>
	typeof locale === 'string' && (APP_LOCALES as readonly string[]).includes(locale);

export const resolveAppLocale = (locale: string | null | undefined): AppLocale =>
	isAppLocale(locale) ? locale : DEFAULT_LOCALE;

export const getHtmlLang = (locale: AppLocale) => LOCALE_TO_HTML_LANG[locale];
