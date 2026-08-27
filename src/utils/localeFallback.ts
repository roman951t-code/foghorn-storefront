import { DEFAULT_LOCALE } from '@/constants/locales';

type TranslationWithLocale = { locale: string };

export function getLocaleFallbacks(locale?: string | null): string[] {
	const normalizedLocale = locale?.trim();
	const requestedLocale = normalizedLocale || DEFAULT_LOCALE;

	if (requestedLocale === DEFAULT_LOCALE) {
		return [DEFAULT_LOCALE];
	}

	return [requestedLocale, DEFAULT_LOCALE];
}

export function pickLocalizedTranslation<T extends TranslationWithLocale>(
	translations: readonly T[] | null | undefined,
	locale?: string | null
): T | null {
	if (!translations?.length) return null;

	for (const requestedLocale of getLocaleFallbacks(locale)) {
		const match = translations.find((translation) => translation.locale === requestedLocale);
		if (match) return match;
	}

	return translations[0] ?? null;
}
