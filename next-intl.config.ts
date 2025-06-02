export default {
	locales: ['en', 'ua', 'ru'],
	defaultLocale: 'en',
	localePrefix: 'as-needed',
	messages: {
		ua: () => import('./locales/ua.json'),
		ru: () => import('./locales/ru.json'),
	},
};
