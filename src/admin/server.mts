import 'dotenv/config';
import crypto from 'node:crypto';
import express from 'express';
import session from 'express-session';
import admin from './admin.mts';
import { createAdminSessionStore } from './pg-session-store.mts';
import { prisma } from './prisma.mts';

const adminEmail = process.env.ADMINJS_EMAIL;
const adminPassword = process.env.ADMINJS_PASSWORD;
const nodeEnv = process.env.NODE_ENV ?? 'development';
const readonlyEmail =
	process.env.ADMINJS_READONLY_EMAIL ??
	(nodeEnv !== 'production' ? 'readonly@mail.com' : undefined);
const readonlyPassword =
	process.env.ADMINJS_READONLY_PASSWORD ?? (nodeEnv !== 'production' ? 'test' : undefined);
const sessionSecret = process.env.ADMINJS_SESSION_SECRET;
const cookiePassword = process.env.ADMINJS_COOKIE_PASSWORD ?? sessionSecret;
const databaseUrl = process.env.DATABASE_URL;
const parsePositiveInt = (value: string | undefined, fallback: number) => {
	const parsed = Number.parseInt(value ?? '', 10);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};
const parseBoolean = (value: string | undefined, fallback: boolean) => {
	if (!value || value.trim() === '') return fallback;
	const normalized = value.trim().toLowerCase();
	if (normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on') {
		return true;
	}
	if (normalized === '0' || normalized === 'false' || normalized === 'no' || normalized === 'off') {
		return false;
	}
	return fallback;
};
const sessionTtlSeconds = parsePositiveInt(process.env.ADMINJS_SESSION_TTL_SECONDS, 60 * 60 * 24);
const sessionCleanupIntervalSeconds = parsePositiveInt(
	process.env.ADMINJS_SESSION_CLEANUP_INTERVAL_SECONDS,
	60 * 15
);
const sessionTable = process.env.ADMINJS_SESSION_TABLE ?? 'admin_session';
const loginMaxRetries = parsePositiveInt(process.env.ADMINJS_LOGIN_MAX_RETRIES, 8);
const loginRetryWindowSeconds = parsePositiveInt(
	process.env.ADMINJS_LOGIN_RETRY_WINDOW_SECONDS,
	60 * 10
);
const adminThumbRateLimitPerMinute = parsePositiveInt(
	process.env.ADMIN_THUMBNAIL_RATE_LIMIT_PER_MINUTE,
	90
);
const allowedAdminIps = new Set(
	(process.env.ADMINJS_ALLOWED_IPS ?? '')
		.split(',')
		.map((value) => value.trim())
		.filter(Boolean)
);
const requireActiveAdminUser = parseBoolean(
	process.env.ADMINJS_REQUIRE_ACTIVE_USER,
	nodeEnv === 'production'
);

type AdminThumbRateState = {
	count: number;
	resetAt: number;
};
const adminThumbRateBuckets = new Map<string, AdminThumbRateState>();
const ADMIN_THUMB_RATE_LIMIT_WINDOW_MS = 60_000;
const ADMIN_THUMB_BUCKET_CLEANUP_INTERVAL_MS = 60_000;
const ADMIN_THUMB_MAX_FALLBACK_BUCKETS = 8_000;
let adminThumbCleanupTimer: ReturnType<typeof setInterval> | null = null;

const pruneExpiredAdminThumbBuckets = (now = Date.now()) => {
	for (const [bucketKey, state] of adminThumbRateBuckets) {
		if (now >= state.resetAt) {
			adminThumbRateBuckets.delete(bucketKey);
		}
	}
};

const trimOldestAdminThumbBuckets = (maxEntries: number) => {
	if (adminThumbRateBuckets.size <= maxEntries) return;
	const overflow = adminThumbRateBuckets.size - maxEntries;
	for (let i = 0; i < overflow; i += 1) {
		const oldestKey = adminThumbRateBuckets.keys().next().value as string | undefined;
		if (!oldestKey) break;
		adminThumbRateBuckets.delete(oldestKey);
	}
};

const ensureAdminThumbCleanupLoop = () => {
	if (adminThumbCleanupTimer) return;
	adminThumbCleanupTimer = setInterval(() => {
		pruneExpiredAdminThumbBuckets();
		trimOldestAdminThumbBuckets(ADMIN_THUMB_MAX_FALLBACK_BUCKETS);
	}, ADMIN_THUMB_BUCKET_CLEANUP_INTERVAL_MS);
	(adminThumbCleanupTimer as { unref?: () => void }).unref?.();
};

const normalizeIp = (value: string) => {
	const trimmed = value.trim();
	return trimmed.startsWith('::ffff:') ? trimmed.slice(7) : trimmed;
};

const isAllowedAdminIp = (value: string) => {
	if (allowedAdminIps.size === 0) return true;
	const normalized = normalizeIp(value);
	return allowedAdminIps.has(value) || allowedAdminIps.has(normalized);
};

const safeEqual = (left: string | undefined, right: string | undefined) => {
	if (!left || !right) return false;
	const leftBuffer = Buffer.from(left, 'utf8');
	const rightBuffer = Buffer.from(right, 'utf8');
	if (leftBuffer.length !== rightBuffer.length) return false;
	return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const WEAK_SECRET_VALUES = new Set([
	'test',
	'password',
	'admin',
	'123456',
	'dev-adminjs-session-secret',
	'changeme',
]);

const hasStrongSecret = (value: string, minLength: number) => {
	const normalized = value.trim();
	if (normalized.length < minLength) {
		return false;
	}
	return !WEAK_SECRET_VALUES.has(normalized.toLowerCase());
};

const checkAdminThumbRateLimit = (key: string) => {
	const now = Date.now();
	pruneExpiredAdminThumbBuckets(now);
	trimOldestAdminThumbBuckets(ADMIN_THUMB_MAX_FALLBACK_BUCKETS);
	const existing = adminThumbRateBuckets.get(key);
	if (!existing || now >= existing.resetAt) {
		adminThumbRateBuckets.set(key, {
			count: 1,
			resetAt: now + ADMIN_THUMB_RATE_LIMIT_WINDOW_MS,
		});
		return { allowed: true as const };
	}
	if (existing.count >= adminThumbRateLimitPerMinute) {
		return {
			allowed: false as const,
			retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
		};
	}
	existing.count += 1;
	return { allowed: true as const };
};

const fallbackAdminSecurityHeaders: express.RequestHandler = (_req, res, next) => {
	res.setHeader('X-Content-Type-Options', 'nosniff');
	res.setHeader('X-Frame-Options', 'DENY');
	res.setHeader('Referrer-Policy', 'no-referrer');
	res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
	res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
	res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
	if (nodeEnv === 'production') {
		res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
	}
	next();
};

const createAdminSecurityMiddleware = async (): Promise<express.RequestHandler> => {
	try {
		const helmetModuleName = 'helmet';
		const helmet = (await import(helmetModuleName)).default as (
			options?: Record<string, unknown>
		) => express.RequestHandler;

		return helmet({
			contentSecurityPolicy: false,
			crossOriginEmbedderPolicy: false,
			referrerPolicy: { policy: 'no-referrer' },
			hsts:
				nodeEnv === 'production'
					? { maxAge: 31536000, includeSubDomains: true, preload: false }
					: false,
		});
	} catch {
		console.warn('Helmet package not found; using fallback admin security headers middleware.');
		return fallbackAdminSecurityHeaders;
	}
};

if (!adminEmail || !adminPassword || !sessionSecret || !cookiePassword || !databaseUrl) {
	throw new Error(
		'Missing ADMINJS_EMAIL, ADMINJS_PASSWORD, ADMINJS_SESSION_SECRET, or DATABASE_URL in environment',
	);
}

if (nodeEnv === 'production') {
	if (!hasStrongSecret(adminPassword, 12)) {
		throw new Error(
			'ADMINJS_PASSWORD must be a strong secret (minimum 12 characters and not a common default).'
		);
	}
	if (!hasStrongSecret(sessionSecret, 24)) {
		throw new Error(
			'ADMINJS_SESSION_SECRET must be a strong secret (minimum 24 characters and not a common default).'
		);
	}
	if (allowedAdminIps.size === 0) {
		console.warn(
			'[admin-security] ADMINJS_ALLOWED_IPS is not set. Consider IP allowlisting the admin panel in production.'
		);
	}
}

const hasActiveAdminProfile = async (email: string) => {
	try {
		const user = await prisma.user.findUnique({
			where: { email },
			select: { adminStatus: true },
		});
		return user?.adminStatus === 'ACTIVE';
	} catch (error) {
		console.error('[admin-auth] Failed to verify admin profile', error);
		return false;
	}
};

const authenticate = async (email: string, password: string) => {
	const isAdminCredential = safeEqual(email, adminEmail) && safeEqual(password, adminPassword);
	const isReadonlyCredential =
		safeEqual(email, readonlyEmail) && safeEqual(password, readonlyPassword);

	if (!isAdminCredential && !isReadonlyCredential) {
		return null;
	}

	if (requireActiveAdminUser) {
		const isActiveAdmin = await hasActiveAdminProfile(email);
		if (!isActiveAdmin) {
			return null;
		}
	}

	return { email, role: isAdminCredential ? 'admin' : 'readonly' };
};

const start = async () => {
	if (nodeEnv !== 'production') {
		await admin.watch();
	}
	const { default: AdminJSExpress } = await import('@adminjs/express');
	const app = express();
	app.disable('x-powered-by');
	app.use(await createAdminSecurityMiddleware());
	if (nodeEnv === 'production') {
		// Required when secure cookies are used behind TLS-terminating proxies.
		app.set('trust proxy', 1);
	}
	ensureAdminThumbCleanupLoop();
	const sessionStore = createAdminSessionStore({
		connectionString: databaseUrl,
		tableName: sessionTable,
		defaultTtlSeconds: sessionTtlSeconds,
		cleanupIntervalSeconds: sessionCleanupIntervalSeconds,
	});
	const adminSessionOptions = {
		resave: false,
		saveUninitialized: false,
		secret: cookiePassword,
		store: sessionStore,
		proxy: nodeEnv === 'production',
		cookie: {
			httpOnly: true,
			secure: nodeEnv === 'production',
			sameSite: 'strict' as const,
			maxAge: sessionTtlSeconds * 1000,
		},
	};
	const adminSessionMiddleware = session({
		...adminSessionOptions,
		name: 'adminjs',
	});

	const router = AdminJSExpress.buildAuthenticatedRouter(
		admin,
		{
			authenticate,
			cookieName: 'adminjs',
			cookiePassword,
			maxRetries: {
				count: loginMaxRetries,
				duration: loginRetryWindowSeconds,
			},
		},
		undefined,
		adminSessionOptions,
	);

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

	app.use('/admin-thumb', adminSessionMiddleware);
	app.get('/admin-thumb', async (req, res) => {
		const requesterIp = typeof req.ip === 'string' ? req.ip : '';
		if (allowedAdminIps.size > 0 && (!requesterIp || !isAllowedAdminIp(requesterIp))) {
			res.status(403).send('Forbidden');
			return;
		}

		const currentAdmin = (req.session as any)?.adminUser as { email?: string } | undefined;
		if (!currentAdmin?.email) {
			res.status(401).send('Unauthorized');
			return;
		}

		const rateKey = normalizeIp(requesterIp || 'unknown');
		const thumbRate = checkAdminThumbRateLimit(rateKey);
		if (!thumbRate.allowed) {
			res.setHeader('Retry-After', String(thumbRate.retryAfterSeconds));
			res.status(429).send('Too Many Requests');
			return;
		}

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

	const gatedRouter = express.Router();
	if (allowedAdminIps.size > 0) {
		gatedRouter.use((req, res, next) => {
			const ip = typeof req.ip === 'string' ? req.ip : '';
			if (!ip || !isAllowedAdminIp(ip)) {
				res.status(403).send('Forbidden');
				return;
			}
			next();
		});
	}

	gatedRouter.use((req, res, next) => {
		const currentAdmin = (req.session as any)?.adminUser as { role?: string } | undefined;
		const isReadonly = currentAdmin?.role === 'readonly';
		const path = typeof req.path === 'string' ? req.path : '';
		if (isReadonly && req.method === 'POST' && path.startsWith('/api/')) {
			const safePostActions = new Set(['lowStockAlerts']);
			const matchResourceAction = path.match(/^\/api\/resources\/[^/]+\/actions\/([^/]+)$/);
			const matchRecordAction = path.match(/^\/api\/resources\/[^/]+\/records\/[^/]+\/([^/]+)$/);
			const matchBulkAction = path.match(/^\/api\/resources\/[^/]+\/bulk\/([^/]+)$/);
			const actionName = matchResourceAction?.[1] ?? matchRecordAction?.[1] ?? matchBulkAction?.[1] ?? null;

			if (actionName && safePostActions.has(actionName)) {
				next();
				return;
			}

			res.status(403).json({
				notice: {
					message: 'Read-only account: changes are disabled.',
					type: 'error',
				},
			});
			return;
		}
		next();
	});
	gatedRouter.use(router);

	app.use(admin.options.rootPath, gatedRouter);

	const port = Number(process.env.ADMINJS_PORT ?? 3001);
	app.listen(port, () => {
		console.log(`AdminJS available at http://localhost:${port}${admin.options.rootPath}`);
	});
};

start().catch((error) => {
	console.error('Failed to start AdminJS server', error);
	process.exit(1);
});
