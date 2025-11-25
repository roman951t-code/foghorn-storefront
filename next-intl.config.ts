export default {
	locales: ['ua', 'us'],
	defaultLocale: 'ua',
	localePrefix: 'as-needed',
	messages: {
		ua: () => import('./locales/ua.json'),
		us: () => import('./locales/us.json'),
	},
};
