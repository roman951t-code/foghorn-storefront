'use client';
import { useEffect } from 'react';

const messages = {
	us: {
		title: 'Something went wrong',
		description: 'An unexpected error occurred. Please try again.',
		tryAgain: 'Try again',
	},
	ua: {
		title: 'Сталася помилка',
		description: 'Виникла непередбачена помилка. Спробуйте ще раз.',
		tryAgain: 'Спробувати ще раз',
	},
} as const;

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
		if (typeof window === 'undefined') return 'us';
		const [, locale] = window.location.pathname.split('/');
		return locale === 'ua' ? 'ua' : 'us';
	};

	const locale = localeFromPath();
	const htmlLang = locale === 'ua' ? 'uk' : 'en-US';
	const copy = messages[locale];

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
