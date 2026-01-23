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

	const storeAppUrl =
		process.env.ADMIN_THUMBNAIL_APP_URL ??
		(nodeEnv !== 'production' ? 'http://localhost:3000' : process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000');
	const allowedThumbHosts = new Set(
		[
			new URL(storeAppUrl).hostname,
			'images.unsplash.com',
			'loremflickr.com',
			'picsum.photos',
			'fastly.picsum.photos',
			...(process.env.ADMIN_THUMBNAIL_ALLOWED_HOSTS ?? '')
				.split(',')
				.map((v) => v.trim())
				.filter(Boolean),
		].filter(Boolean)
	);
	const allowAnyThumbHost = nodeEnv !== 'production' && process.env.ADMIN_THUMBNAIL_ALLOW_ANY_HOST === 'true';

	app.get('/admin-thumb', async (req, res) => {
		const urlParam = typeof req.query.url === 'string' ? req.query.url : '';
		const widthParam = typeof req.query.w === 'string' ? req.query.w : '';
		const qualityParam = typeof req.query.q === 'string' ? req.query.q : '';

		if (!urlParam) {
			res.status(400).send('Missing url');
			return;
		}

		let targetUrl: URL;
		try {
			targetUrl = urlParam.startsWith('/')
				? new URL(urlParam, storeAppUrl)
				: new URL(urlParam);
		} catch {
			res.status(400).send('Invalid url');
			return;
		}

		if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
			res.status(400).send('Invalid protocol');
			return;
		}

		if (!allowAnyThumbHost && !allowedThumbHosts.has(targetUrl.hostname)) {
			res.status(400).send('Host not allowed');
			return;
		}

		const w = Math.max(16, Math.min(1024, Number(widthParam) || 256));
		const q = Math.max(10, Math.min(90, Number(qualityParam) || 70));

		const optimizerUrl = new URL('/_next/image', storeAppUrl);
		optimizerUrl.searchParams.set('url', targetUrl.toString());
		optimizerUrl.searchParams.set('w', String(w));
		optimizerUrl.searchParams.set('q', String(q));

		try {
			const fetchWithAllowedRedirects = async (startUrl: URL) => {
				let current = startUrl;
				for (let i = 0; i < 4; i += 1) {
					const response = await fetch(current, {
						headers: { accept: 'image/*,*/*' },
						redirect: 'manual',
					});

					if (response.status >= 300 && response.status < 400) {
						const loc = response.headers.get('location');
						if (!loc) return null;
						let next: URL;
						try {
							next = new URL(loc, current);
						} catch {
							return null;
						}
						if ((next.protocol !== 'http:' && next.protocol !== 'https:') || (!allowAnyThumbHost && !allowedThumbHosts.has(next.hostname))) {
							return null;
						}
						current = next;
						continue;
					}

					if (!response.ok) return null;
					const contentType = response.headers.get('content-type') ?? 'application/octet-stream';
					const buf = Buffer.from(await response.arrayBuffer());
					return { contentType, buf };
				}
				return null;
			};

			const tryOptimizer = async () => {
				const response = await fetch(optimizerUrl, {
					headers: {
						accept: 'image/avif,image/webp,image/*,*/*',
					},
				});
				if (!response.ok) return null;
				const contentType = response.headers.get('content-type') ?? 'application/octet-stream';
				const buf = Buffer.from(await response.arrayBuffer());
				return { contentType, buf };
			};

			const optimized = await tryOptimizer();
			if (optimized) {
				res.setHeader('Content-Type', optimized.contentType);
				res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
				res.status(200).send(optimized.buf);
				return;
			}

			const original = await fetchWithAllowedRedirects(targetUrl);
			if (!original) {
				res.status(502).send('Failed to fetch image');
				return;
			}
			res.setHeader('Content-Type', original.contentType);
			res.setHeader('Cache-Control', 'public, max-age=3600');
			res.status(200).send(original.buf);
		} catch {
			res.status(502).send('Thumbnail proxy error');
		}
	});

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
