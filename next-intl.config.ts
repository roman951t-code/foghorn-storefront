import { APP_LOCALES, DEFAULT_LOCALE } from './src/constants/locales';

export default {
	locales: APP_LOCALES,
	defaultLocale: DEFAULT_LOCALE,
	localePrefix: 'as-needed',
	messages: {
		uk: () => import('./locales/uk.json'),
		en: () => import('./locales/en.json'),
	},
};
