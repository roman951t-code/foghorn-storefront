'use client';

import { useEffect } from 'react';
import { GLOBAL_ERROR_MESSAGES } from '@/constants/errors';
import {
	DEFAULT_LOCALE,
	LANGUAGE_OPTIONS,
	LOCALE_TO_HTML_LANG,
	type AppLocale,
} from '@/constants/locales';

const getLocaleFromPath = (): AppLocale => {
	if (typeof window === 'undefined') return DEFAULT_LOCALE;
	const [, maybeLocale] = window.location.pathname.split('/');
	const isSupportedLocale = LANGUAGE_OPTIONS.some(({ value }) => value === maybeLocale);
	return isSupportedLocale ? (maybeLocale as AppLocale) : DEFAULT_LOCALE;
};

const styles = {
	body: {
		margin: 0,
		minHeight: '100vh',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		background: 'radial-gradient(circle at 10% 20%, #16355f 0, #0a0f1f 40%)',
		fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
		color: '#e2e8f0',
		padding: '24px',
	},
	card: {
		width: 'min(520px, 100%)',
		background: 'rgba(12, 19, 38, 0.92)',
		borderWidth: '0.5px',
		borderStyle: 'solid',
		borderColor: 'rgba(255, 255, 255, 0.08)',
		borderRadius: '16px',
		padding: '24px',
		boxShadow: '0 20px 60px rgba(0, 0, 0, 0.45)',
		backdropFilter: 'blur(6px)',
	},
	title: {
		fontSize: '24px',
		margin: '0 0 8px',
		letterSpacing: '-0.01em',
	},
	description: {
		margin: 0,
		color: '#cbd5e1',
		lineHeight: 1.6,
	},
	actions: {
		marginTop: '20px',
		display: 'flex',
		gap: '12px',
	},
	button: {
		background: '#22c55e',
		color: '#0a0f1f',
		border: 'none',
		borderRadius: '12px',
		padding: '12px 16px',
		fontWeight: 700,
		cursor: 'pointer',
		fontSize: '15px',
		boxShadow: '0 12px 30px rgba(34, 197, 94, 0.35)',
	},
};

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

	const locale = getLocaleFromPath();
	const htmlLang = LOCALE_TO_HTML_LANG[locale] ?? LOCALE_TO_HTML_LANG[DEFAULT_LOCALE];
	const copy = GLOBAL_ERROR_MESSAGES[locale] ?? GLOBAL_ERROR_MESSAGES[DEFAULT_LOCALE];

	return (
		<html lang={htmlLang}>
			<body style={styles.body}>
				<main role='alert' aria-live='assertive' style={styles.card}>
					<h1 style={styles.title}>{copy.title}</h1>
					<p style={styles.description}>{copy.description}</p>
					<div style={styles.actions}>
						<button
							type='button'
							aria-label={copy.tryAgain}
							onClick={() => reset()}
							style={styles.button}
						>
							{copy.tryAgain}
						</button>
					</div>
				</main>
			</body>
		</html>
	);
}
