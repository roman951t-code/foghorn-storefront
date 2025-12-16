'use client';
import { useEffect } from 'react';
import { GLOBAL_ERROR_MESSAGES } from '@/constants/errors';
import { DEFAULT_LOCALE, LOCALE_TO_HTML_LANG, type AppLocale } from '@/constants/locales';

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error('Global error boundary caught:', error);
	}, [error]);

	const localeFromPath = () => {
		if (typeof window === 'undefined') return DEFAULT_LOCALE;
		const [, locale] = window.location.pathname.split('/');
		return locale === 'uk' || locale === 'en' ? (locale as AppLocale) : DEFAULT_LOCALE;
	};

	const locale = localeFromPath();
	const htmlLang = LOCALE_TO_HTML_LANG[locale] ?? LOCALE_TO_HTML_LANG[DEFAULT_LOCALE];
	const copy = GLOBAL_ERROR_MESSAGES[locale] ?? GLOBAL_ERROR_MESSAGES[DEFAULT_LOCALE];

	return (
		<html lang={htmlLang}>
			<body>
				<h2>⚠️ {copy.title}</h2>
				<p>{copy.description}</p>
				<button
					type='button'
					aria-label={copy.tryAgain}
					onClick={() => reset()}
					style={{ marginTop: '16px' }}
				>
					🔁 {copy.tryAgain}
				</button>
			</body>
		</html>
	);
}
