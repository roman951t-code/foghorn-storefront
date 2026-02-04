import AdminJS from 'adminjs';
import { Database, Resource } from '@adminjs/prisma';
import { chakraTheme } from './config/theme.mts';
import { componentLoader, dashboardComponent } from './config/components.mts';
import { dashboardMetrics } from './actions/dashboard-actions.mts';
import { translations } from './config/locale.mts';
import { resources } from './resources/index.mts';

AdminJS.registerAdapter({ Database, Resource });

const rootPath = process.env.ADMINJS_ROOT_PATH ?? '/admin';
const admin = new AdminJS({
	rootPath,
	componentLoader,
	assets: {
		scripts: ['/adminjs-readonly.js'],
	},
	availableThemes: [chakraTheme],
	defaultTheme: chakraTheme.id,
	dashboard: {
		component: dashboardComponent,
		handler: dashboardMetrics,
	},
	locale: {
		language: 'en',
		availableLanguages: ['en', 'ua'],
		translations,
		localeDetection: true,
	},
	branding: {
		favicon: '/favicon.svg',
	},
	resources,
});

export default admin;
