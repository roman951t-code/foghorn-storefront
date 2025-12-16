export const LANGUAGE_OPTIONS = [
	{ value: 'uk', label: 'Укр', flag: '🇺🇦' },
	{ value: 'en', label: 'Eng', flag: '🇺🇸' },
] as const;

export type AppLocale = (typeof LANGUAGE_OPTIONS)[number]['value'];

export const LOCALE_SWITCHER_LABEL = 'Change language';

export const LOCALE_TO_INTL_MAP: Record<string, string> = {
	uk: 'uk-UA',
	en: 'en-US',
};

export const LOCALE_TO_HTML_LANG: Record<'uk' | 'en', string> = {
	uk: 'uk',
	en: 'en-US',
};

export const DEFAULT_LOCALE: AppLocale = 'uk';
