import { getRequestConfig } from 'next-intl/server';
import * as Sentry from '@sentry/nextjs';
import { loadLocaleMessages } from './messages';
import { resolveAppLocale } from '@/constants/locales';

export default getRequestConfig(async ({ requestLocale }) => {
	const requested = await requestLocale;
	const locale = resolveAppLocale(requested);

	return {
		locale,
		messages: await loadLocaleMessages(locale),
		// A missing/typo'd translation key doesn't crash the page — next-intl
		// renders the raw "namespace.key" string and only console.errors by
		// default, so a bad key could ship silently with no monitoring signal.
		onError(error) {
			console.error(error);
			Sentry.captureException(error);
		},
	};
});
