import type { AppLocale } from '@/constants/locales';

export const CLIENT_MESSAGE_NAMESPACES = [
	'common',
	'auth',
	'validation',
	'products',
	'cart',
	'navigation',
	'wishlist',
	'pages',
	'errors',
	'checkout',
	'orders',
	'pagination',
] as const;

const localeMessages = {
	uk: () => import('../../locales/uk.json').then((module) => module.default),
	en: () => import('../../locales/en.json').then((module) => module.default),
} satisfies Record<AppLocale, () => Promise<Record<string, unknown>>>;

export const loadLocaleMessages = (locale: AppLocale) => localeMessages[locale]();
