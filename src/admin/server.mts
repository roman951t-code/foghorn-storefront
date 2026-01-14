import 'dotenv/config';
import express from 'express';
import admin from './admin.mts';

const adminEmail = process.env.ADMINJS_EMAIL;
const adminPassword = process.env.ADMINJS_PASSWORD;
const sessionSecret = process.env.ADMINJS_SESSION_SECRET;
const cookiePassword = process.env.ADMINJS_COOKIE_PASSWORD ?? sessionSecret;
const nodeEnv = process.env.NODE_ENV ?? 'development';

if (!adminEmail || !adminPassword || !sessionSecret || !cookiePassword) {
	throw new Error(
		'Missing ADMINJS_EMAIL, ADMINJS_PASSWORD, or ADMINJS_SESSION_SECRET in environment',
	);
}

const authenticate = async (email: string, password: string) => {
	if (email === adminEmail && password === adminPassword) {
		return { email };
	}
	return null;
};

const start = async () => {
	if (nodeEnv !== 'production') {
		await admin.watch();
	}
	const { default: AdminJSExpress } = await import('@adminjs/express');

	const router = AdminJSExpress.buildAuthenticatedRouter(
		admin,
		{
			authenticate,
			cookieName: 'adminjs',
			cookiePassword,
		},
		undefined,
		{
			resave: false,
			saveUninitialized: false,
			secret: sessionSecret,
			cookie: {
				httpOnly: true,
				secure: nodeEnv === 'production',
				sameSite: 'lax',
			},
		},
	);

	const app = express();
	app.use(express.static('public'));
	app.use(admin.options.rootPath, router);

	const port = Number(process.env.ADMINJS_PORT ?? 3001);
	app.listen(port, () => {
		console.log(`AdminJS available at http://localhost:${port}${admin.options.rootPath}`);
	});
};

start().catch((error) => {
	console.error('Failed to start AdminJS server', error);
	process.exit(1);
});
