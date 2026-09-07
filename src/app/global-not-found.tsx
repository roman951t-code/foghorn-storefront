'use client';

import Link from 'next/link';
import { GLOBAL_NOT_FOUND_MESSAGES } from '@/constants/errors';
import { DEFAULT_LOCALE, getHtmlLang, isAppLocale, type AppLocale } from '@/constants/locales';
import { SITE_NAME } from '@/constants/site';

const getLocaleFromPath = (): AppLocale => {
	if (typeof window === 'undefined') return DEFAULT_LOCALE;
	const [, maybeLocale] = window.location.pathname.split('/');
	return isAppLocale(maybeLocale) ? maybeLocale : DEFAULT_LOCALE;
};

const styles = {
	body: {
		margin: 0,
		minHeight: '100vh',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		background: 'radial-gradient(circle at 80% 20%, #1e2d4a 0, #0a0f1f 45%)',
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
	code: {
		display: 'inline-block',
		padding: '6px 12px',
		borderRadius: '10px',
		background: 'rgba(255, 255, 255, 0.08)',
		color: '#cbd5e1',
		fontWeight: 700,
		letterSpacing: '0.08em',
		fontSize: '16px',
		textTransform: 'uppercase',
		marginBottom: '10px',
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
	action: {
		marginTop: '20px',
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: '8px',
		background: '#22c55e',
		color: '#0a0f1f',
		borderRadius: '12px',
		padding: '12px 16px',
		fontWeight: 700,
		textDecoration: 'none',
		fontSize: '16px',
		boxShadow: '0 12px 30px rgba(34, 197, 94, 0.35)',
	},
};

export default function GlobalNotFound() {
	const locale = getLocaleFromPath();
	const htmlLang = getHtmlLang(locale);
	const copy = GLOBAL_NOT_FOUND_MESSAGES[locale] ?? GLOBAL_NOT_FOUND_MESSAGES[DEFAULT_LOCALE];

	return (
		<html lang={htmlLang}>
			<head>
				<title>{`Page not found | ${SITE_NAME}`}</title>
				<meta name='robots' content='noindex, nofollow' />
			</head>
			<body style={styles.body}>
				<main role='main' aria-labelledby='global-not-found-title' style={styles.card}>
					<span style={styles.code}>404</span>
					<h1 id='global-not-found-title' style={styles.title}>
						{copy.title}
					</h1>
					<p style={styles.description}>{copy.description}</p>
					<Link
						href={locale === DEFAULT_LOCALE ? '/' : `/${locale}`}
						aria-label={copy.goHome}
						style={styles.action}
					>
						{copy.goHome}
					</Link>
				</main>
			</body>
		</html>
	);
}
