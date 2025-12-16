export default {
	locales: ['uk', 'en'],
	defaultLocale: 'uk',
	localePrefix: 'as-needed',
	messages: {
		uk: () => import('./locales/uk.json'),
		en: () => import('./locales/en.json'),
	},
};
