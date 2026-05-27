import { getRequestConfig } from 'next-intl/server';
import { loadLocaleMessages } from './messages';
import { resolveAppLocale } from '@/constants/locales';

export default getRequestConfig(async ({ requestLocale }) => {
	const requested = await requestLocale;
	const locale = resolveAppLocale(requested);

	return {
		locale,
		messages: await loadLocaleMessages(locale),
	};
});
