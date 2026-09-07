// Unbuffered stderr diagnostics so Render logs show exactly where startup dies.
// pino is buffered and may lose the last messages on crash/exit.
const bootLog = (message: string, extra?: Record<string, unknown>) => {
	const payload = extra ? ` ${JSON.stringify(extra)}` : '';
	process.stderr.write(`[admin:boot] ${message}${payload}\n`);
};
bootLog('module load: begin');

process.on('uncaughtException', (err) => {
	bootLog('uncaughtException', { message: (err as Error)?.message, stack: (err as Error)?.stack });
	process.exit(1);
});
process.on('unhandledRejection', (reason) => {
	const err = reason as Error;
	bootLog('unhandledRejection', { message: err?.message ?? String(reason), stack: err?.stack });
	process.exit(1);
});

import 'dotenv/config';
import crypto from 'node:crypto';
import { existsSync, statSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';
bootLog('module load: imports 1/2 done (crypto, fs, path, dotenv)');
import {
	adminHttpLogger,
	adminLogger,
	captureAdminException,
	setupAdminErrorTracking,
} from './observability.mts';
import express from 'express';
import session from 'express-session';
bootLog('module load: express + session loaded');
import admin from './admin.mts';
bootLog('module load: admin.mts loaded');
import { createAdminSessionStore } from './pg-session-store.mts';
import { prisma } from './prisma.mts';
bootLog('module load: prisma + session store loaded');
import {
	getAdminApiActionNameFromPath,
	getAdminApiContextFromPath,
	normalizeAdminApiNoticeResponse,
} from './server/admin-api-routing.mts';
import { createFixedWindowRateLimiter } from './server/fixed-window-rate-limiter.mts';
import { checkUpstashRateLimit } from './server/upstash-rate-limiter.mts';
import { verifyServerFetchUrl } from './utils/server-fetch-safety.mts';
bootLog('module load: all imports done');

const adminEmail = process.env.ADMINJS_EMAIL;
const adminPassword = process.env.ADMINJS_PASSWORD;
const nodeEnv = process.env.NODE_ENV ?? 'development';
const readonlyEmail =
	process.env.ADMINJS_READONLY_EMAIL ??
	(nodeEnv !== 'production' ? 'readonly@mail.com' : undefined);
const readonlyPassword =
	process.env.ADMINJS_READONLY_PASSWORD ?? (nodeEnv !== 'production' ? 'test' : undefined);
const sessionSecret = process.env.ADMINJS_SESSION_SECRET;
const explicitCookiePassword = process.env.ADMINJS_COOKIE_PASSWORD;
const cookiePassword = explicitCookiePassword ?? sessionSecret;
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
	60 * 15,
);
const sessionTable = process.env.ADMINJS_SESSION_TABLE ?? 'admin_session';
const loginMaxRetries = parsePositiveInt(process.env.ADMINJS_LOGIN_MAX_RETRIES, 8);
const loginRetryWindowSeconds = parsePositiveInt(
	process.env.ADMINJS_LOGIN_RETRY_WINDOW_SECONDS,
	60 * 10,
);
const adminThumbRateLimitPerMinute = parsePositiveInt(
	process.env.ADMIN_THUMBNAIL_RATE_LIMIT_PER_MINUTE,
	90,
);
const allowedAdminIps = new Set(
	(process.env.ADMINJS_ALLOWED_IPS ?? '')
		.split(',')
		.map((value) => value.trim())
		.filter(Boolean),
);
const requireActiveAdminUser = parseBoolean(
	process.env.ADMINJS_REQUIRE_ACTIVE_USER,
	nodeEnv === 'production',
);
const adminPort = Number(process.env.ADMINJS_PORT ?? process.env.PORT ?? 3001);
const adminCookieName = nodeEnv === 'production' ? '__Host-adminjs' : 'adminjs';

type AdminCspMode = 'off' | 'report-only' | 'enforce';

const parseAdminCspMode = (value: string | undefined, fallback: AdminCspMode): AdminCspMode => {
	if (!value || value.trim() === '') return fallback;
	const normalized = value.trim().toLowerCase();
	if (normalized === 'off' || normalized === 'report-only' || normalized === 'enforce') {
		return normalized;
	}
	return fallback;
};

const normalizeAllowedOriginHost = (value: string): string | null => {
	const trimmed = value.trim();
	if (!trimmed) return null;
	try {
		return new URL(trimmed).host.toLowerCase();
	} catch {
		return /^[A-Za-z0-9.-]+(?::\d+)?$/.test(trimmed) ? trimmed.toLowerCase() : null;
	}
};

const adminCspMode = parseAdminCspMode(
	process.env.ADMIN_CSP_MODE,
	nodeEnv === 'production' ? 'enforce' : 'off',
);
const adminApiReadRateLimitPerMinute = parsePositiveInt(
	process.env.ADMIN_API_READ_RATE_LIMIT_PER_MINUTE,
	180,
);
const adminApiMutationRateLimitPerMinute = parsePositiveInt(
	process.env.ADMIN_API_MUTATION_RATE_LIMIT_PER_MINUTE,
	90,
);
const adminApiRateLimitWindowMs =
	parsePositiveInt(process.env.ADMIN_API_RATE_LIMIT_WINDOW_SECONDS, 60) * 1000;
const safeHttpMethods = new Set(['GET', 'HEAD', 'OPTIONS']);
const SAFE_READONLY_POST_ACTIONS = new Set(['lowStockAlerts']);
const MUTATING_ADMIN_ACTIONS = new Set([
	'archive',
	'archiveProduct',
	'bulkAdjustPrice',
	'bulkAdjustStock',
	'bulkEditTags',
	'bulkMarkDelivered',
	'bulkMarkShipped',
	'bulkSeoTemplate',
	'bulkSetBrand',
	'bulkSetCategory',
	'bulkToggleInStock',
	'cancelOrder',
	'deleteOrder',
	'deleteProduct',
	'deleteUser',
	'duplicate',
	'duplicateBanner',
	'duplicateProduct',
	'edit',
	'markDelivered',
	'markPaid',
	'markShipped',
	'new',
	'processReturn',
	'publish',
	'publishProduct',
	'revokeSession',
	'scheduleDiscount',
	'schedulePublish',
	'setFulfillment',
	'setStatus',
	'updateUserAdminMeta',
]);
const adminAllowedOriginHosts = new Set<string>([
	`localhost:${adminPort}`,
	`127.0.0.1:${adminPort}`,
	`[::1]:${adminPort}`,
	...[
		process.env.ADMINJS_PUBLIC_URL ?? '',
		process.env.APP_URL ?? '',
		process.env.NEXT_PUBLIC_APP_URL ?? '',
		...(process.env.ADMINJS_ALLOWED_ORIGINS ?? '').split(','),
	]
		.map((origin) => normalizeAllowedOriginHost(origin))
		.filter((origin): origin is string => Boolean(origin)),
]);

const ADMIN_THUMB_RATE_LIMIT_WINDOW_MS = 60_000;
const ADMIN_THUMB_BUCKET_CLEANUP_INTERVAL_MS = 60_000;
const ADMIN_THUMB_MAX_FALLBACK_BUCKETS = 8_000;
const ADMIN_API_BUCKET_CLEANUP_INTERVAL_MS = 60_000;
const ADMIN_API_MAX_FALLBACK_BUCKETS = 12_000;
const adminThumbRateLimiter = createFixedWindowRateLimiter({
	windowMs: ADMIN_THUMB_RATE_LIMIT_WINDOW_MS,
	cleanupIntervalMs: ADMIN_THUMB_BUCKET_CLEANUP_INTERVAL_MS,
	maxBuckets: ADMIN_THUMB_MAX_FALLBACK_BUCKETS,
});
const adminApiRateLimiter = createFixedWindowRateLimiter({
	windowMs: adminApiRateLimitWindowMs,
	cleanupIntervalMs: ADMIN_API_BUCKET_CLEANUP_INTERVAL_MS,
	maxBuckets: ADMIN_API_MAX_FALLBACK_BUCKETS,
});

const normalizeIp = (value: string) => {
	const trimmed = value.trim();
	return trimmed.startsWith('::ffff:') ? trimmed.slice(7) : trimmed;
};

const isSafeHttpMethod = (method: string) => safeHttpMethods.has(method.toUpperCase());

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

const resolveAdminMutationOriginHeader = (req: express.Request) =>
	req.get('origin') ?? req.get('referer') ?? null;

const resolveRequestHosts = (req: express.Request) => {
	const hosts = new Set<string>();
	const rawHostHeaders = [req.get('host') ?? ''];
	for (const rawHostHeader of rawHostHeaders) {
		for (const rawHost of rawHostHeader.split(',')) {
			const normalizedHost = normalizeAllowedOriginHost(rawHost);
			if (normalizedHost) {
				hosts.add(normalizedHost);
			}
		}
	}
	return hosts;
};

const isAllowedAdminMutationOrigin = (originHeader: string, req: express.Request) => {
	try {
		const origin = new URL(originHeader);
		const originHost = origin.host.toLowerCase();
		if (resolveRequestHosts(req).has(originHost)) return true;
		return adminAllowedOriginHosts.has(originHost);
	} catch {
		return false;
	}
};

const ADMIN_CSP_POLICY = [
	"default-src 'self'",
	"base-uri 'self'",
	"frame-ancestors 'none'",
	"form-action 'self'",
	"object-src 'none'",
	"script-src 'self' 'unsafe-inline' 'unsafe-eval'",
	"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
	"img-src 'self' data: blob: https:",
	"font-src 'self' data: https://fonts.gstatic.com",
	"connect-src 'self'",
].join('; ');

const createAdminCspMiddleware = (mode: AdminCspMode): express.RequestHandler => {
	if (mode === 'off') return (_req, _res, next) => next();
	const headerName =
		mode === 'enforce' ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only';
	return (_req, res, next) => {
		res.setHeader(headerName, ADMIN_CSP_POLICY);
		next();
	};
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
		const helmet = (await import('helmet')).default as (
			options?: Record<string, unknown>,
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
		adminLogger.warn('Helmet package not found; using fallback admin security headers middleware.');
		return fallbackAdminSecurityHeaders;
	}
};

const isAdminApiMutationIntent = (method: string, actionName: string | null) => {
	if (!isSafeHttpMethod(method)) return true;
	return actionName ? MUTATING_ADMIN_ACTIONS.has(actionName) : false;
};

if (!adminEmail || !adminPassword || !sessionSecret || !cookiePassword || !databaseUrl) {
	throw new Error(
		'Missing ADMINJS_EMAIL, ADMINJS_PASSWORD, ADMINJS_SESSION_SECRET, or DATABASE_URL in environment',
	);
}

if (nodeEnv === 'production') {
	if (!hasStrongSecret(adminPassword, 12)) {
		throw new Error(
			'ADMINJS_PASSWORD must be a strong secret (minimum 12 characters and not a common default).',
		);
	}
	if (!hasStrongSecret(sessionSecret, 24)) {
		throw new Error(
			'ADMINJS_SESSION_SECRET must be a strong secret (minimum 24 characters and not a common default).',
		);
	}
	if (explicitCookiePassword && !hasStrongSecret(explicitCookiePassword, 24)) {
		throw new Error(
			'ADMINJS_COOKIE_PASSWORD must be a strong secret (minimum 24 characters and not a common default).',
		);
	}
	if (!explicitCookiePassword || cookiePassword === sessionSecret) {
		throw new Error('ADMINJS_COOKIE_PASSWORD must be set and differ from ADMINJS_SESSION_SECRET.');
	}
	if (readonlyPassword && !hasStrongSecret(readonlyPassword, 12)) {
		throw new Error(
			'ADMINJS_READONLY_PASSWORD must be a strong secret (minimum 12 characters and not a common default).',
		);
	}
	if (allowedAdminIps.size === 0) {
		adminLogger.warn(
			'[admin-security] ADMINJS_ALLOWED_IPS is not set. Consider IP allowlisting the admin panel in production.',
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
		adminLogger.error({ err: error, email }, '[admin-auth] Failed to verify admin profile');
		captureAdminException(error, { area: 'admin-auth' });
		return false;
	}
};

const authenticate = async (
	email: string,
	password: string,
	context?: { req: express.Request },
) => {
	const requesterIp = context?.req?.ip;
	if (requesterIp) {
		// Distributed backstop on top of AdminJSExpress's own in-memory retry
		// lock: that lock is per-process (resets on every Render redeploy and
		// wouldn't be shared across instances if this ever scales out). Only
		// blocks when Upstash is actually configured for this service — see
		// checkUpstashRateLimit's fail-open contract.
		const distributed = await checkUpstashRateLimit({
			key: `admin-login:${normalizeIp(requesterIp)}`,
			limit: loginMaxRetries,
			windowSeconds: loginRetryWindowSeconds,
		});
		if (distributed && !distributed.allowed) {
			return null;
		}
	}

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

const logBundleStatus = () => {
	if (nodeEnv !== 'production') return;
	const bundleDir = process.env.ADMIN_JS_TMP_DIR ?? '.adminjs';
	const bundlePath = resolvePath(bundleDir, 'bundle.js');
	const cwd = process.cwd();
	bootLog('logBundleStatus', { bundleDir, bundlePath, cwd });
	if (!existsSync(bundlePath)) {
		bootLog('[admin-bundle] MISSING at runtime', { bundlePath, cwd });
		adminLogger.error(
			{ bundlePath, cwd, adminJsSkipBundle: process.env.ADMIN_JS_SKIP_BUNDLE ?? null },
			'[admin-bundle] components.bundle.js is MISSING at runtime. Custom components (Dashboard, TopBar, filters, actions) will fall back to defaults.',
		);
		return;
	}
	const stats = statSync(bundlePath);
	if (stats.size < 100_000) {
		bootLog('[admin-bundle] too small', { bundlePath, size: stats.size });
		adminLogger.error(
			{ bundlePath, sizeBytes: stats.size, cwd },
			'[admin-bundle] components.bundle.js exists but is suspiciously small; the bundler likely aborted. Custom components will not render.',
		);
		return;
	}
	bootLog('[admin-bundle] OK', { bundlePath, size: stats.size });
	adminLogger.info(
		{ bundlePath, sizeBytes: stats.size, adminJsSkipBundle: process.env.ADMIN_JS_SKIP_BUNDLE ?? null },
		'[admin-bundle] components.bundle.js OK',
	);
};

const start = async () => {
	bootLog('start(): entered');
	if (nodeEnv !== 'production') {
		await admin.watch();
	}
	logBundleStatus();
	bootLog('start(): importing @adminjs/express');
	const { default: AdminJSExpress } = await import('@adminjs/express');
	bootLog('start(): @adminjs/express loaded');
	const app = express();
	app.disable('x-powered-by');
	app.use((_req, res, next) => {
		res.setHeader('X-Robots-Tag', 'noindex, nofollow');
		next();
	});
	app.use(adminHttpLogger);
	app.use(await createAdminSecurityMiddleware());
	app.get('/', (_req, res) => {
		res.redirect(301, admin.options.rootPath);
	});
	app.get('/healthz', (_req, res) => {
		res.setHeader('Cache-Control', 'no-store');
		res.status(200).json({
			status: 'ok',
			service: 'admin',
			timestamp: new Date().toISOString(),
		});
	});
	app.use(admin.options.rootPath, createAdminCspMiddleware(adminCspMode));
	if (nodeEnv === 'production') {
		// Required when secure cookies are used behind TLS-terminating proxies.
		app.set('trust proxy', 1);
	}
	adminThumbRateLimiter.ensureCleanupLoop();
	adminApiRateLimiter.ensureCleanupLoop();
	bootLog('start(): creating session store');
	const sessionStore = createAdminSessionStore({
		connectionString: databaseUrl,
		tableName: sessionTable,
		defaultTtlSeconds: sessionTtlSeconds,
		cleanupIntervalSeconds: sessionCleanupIntervalSeconds,
	});
	bootLog('start(): session store created');
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
			path: '/',
			maxAge: sessionTtlSeconds * 1000,
		},
	};
	const adminSessionMiddleware = session({
		...adminSessionOptions,
		name: adminCookieName,
	});

	const router = AdminJSExpress.buildAuthenticatedRouter(
		admin,
		{
			authenticate,
			cookieName: adminCookieName,
			cookiePassword,
			maxRetries: {
				count: loginMaxRetries,
				duration: loginRetryWindowSeconds,
			},
		},
		undefined,
		adminSessionOptions,
	);
	bootLog('start(): AdminJSExpress.buildAuthenticatedRouter returned');

	app.use(express.static('public'));

	const storeAppUrl =
		process.env.ADMIN_THUMBNAIL_APP_URL ??
		(nodeEnv !== 'production' ? 'http://localhost:3000' : process.env.NEXT_PUBLIC_APP_URL);
	const storeAppOriginUrl = storeAppUrl ? new URL(storeAppUrl) : null;
	if (nodeEnv === 'production') {
		if (storeAppOriginUrl) {
			bootLog('start(): verifying store app url', { url: storeAppOriginUrl.origin });
			const storeUrlSafety = await verifyServerFetchUrl(storeAppOriginUrl);
			bootLog('start(): store app url verified', { ok: storeUrlSafety.ok });
			if (!storeUrlSafety.ok) {
				throw new Error(
					`ADMIN_THUMBNAIL_APP_URL/NEXT_PUBLIC_APP_URL is not safe for server-side fetches: ${storeUrlSafety.reason}`,
				);
			}
		} else {
			adminLogger.warn(
				'NEXT_PUBLIC_APP_URL is not set — store product thumbnails will not render in the admin panel.',
			);
		}
	}
	const allowedThumbHosts = new Set(
		[
			storeAppOriginUrl?.hostname,
			'res.cloudinary.com',
			'images.unsplash.com',
			'loremflickr.com',
			'picsum.photos',
			'fastly.picsum.photos',
			...(process.env.ADMIN_THUMBNAIL_ALLOWED_HOSTS ?? '')
				.split(',')
				.map((v) => v.trim())
				.filter(Boolean),
		].filter(Boolean),
	);
	const allowAnyThumbHost =
		nodeEnv !== 'production' && process.env.ADMIN_THUMBNAIL_ALLOW_ANY_HOST === 'true';
	const isConfiguredStoreUrl = (url: URL) =>
		storeAppOriginUrl !== null && url.origin === storeAppOriginUrl.origin;
	const allowsPrivateThumbnailUrl = (url: URL) =>
		nodeEnv !== 'production' && isConfiguredStoreUrl(url);
	const verifyThumbnailUrl = async (url: URL) => {
		if (url.protocol !== 'http:' && url.protocol !== 'https:') {
			return false;
		}
		if (
			isConfiguredStoreUrl(url) &&
			(url.pathname === '/_next/image' || url.pathname.startsWith('/api/'))
		) {
			return false;
		}
		if (!allowAnyThumbHost && !allowedThumbHosts.has(url.hostname)) {
			return false;
		}
		const safety = await verifyServerFetchUrl(url, {
			allowPrivateAddress: allowsPrivateThumbnailUrl(url),
		});
		return safety.ok;
	};

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
		const thumbRate = adminThumbRateLimiter.check(rateKey, adminThumbRateLimitPerMinute);
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
			if (urlParam.startsWith('/')) {
				if (!storeAppUrl) {
					res.status(400).send('Relative URLs require NEXT_PUBLIC_APP_URL to be configured');
					return;
				}
				targetUrl = new URL(urlParam, storeAppUrl);
			} else {
				targetUrl = new URL(urlParam);
			}
		} catch {
			res.status(400).send('Invalid url');
			return;
		}

		if (!(await verifyThumbnailUrl(targetUrl))) {
			res.status(400).send('URL not allowed');
			return;
		}

		const w = Math.max(16, Math.min(1024, Number(widthParam) || 256));
		const q = Math.max(10, Math.min(90, Number(qualityParam) || 70));

		if (!storeAppOriginUrl) {
			res.status(503).send('Store URL not configured');
			return;
		}
		const optimizerUrl = new URL('/_next/image', storeAppOriginUrl);
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
						if (!(await verifyThumbnailUrl(next))) {
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

			const optimized = isConfiguredStoreUrl(targetUrl) ? await tryOptimizer() : null;
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
	gatedRouter.use(adminSessionMiddleware);

	gatedRouter.use((req, res, next) => {
		const path = typeof req.path === 'string' ? req.path : '';
		if (!path.startsWith('/api/')) {
			next();
			return;
		}
		const context = getAdminApiContextFromPath(path);
		const originalJson = res.json.bind(res);
		res.json = ((body: unknown) => {
			const normalizedBody = normalizeAdminApiNoticeResponse(body, context);
			return originalJson(normalizedBody);
		}) as typeof res.json;
		next();
	});

	gatedRouter.use((req, res, next) => {
		const path = typeof req.path === 'string' ? req.path : '';
		if (!path.startsWith('/api/') || isSafeHttpMethod(req.method)) {
			next();
			return;
		}
		const originHeader = resolveAdminMutationOriginHeader(req);
		if (!originHeader || !isAllowedAdminMutationOrigin(originHeader, req)) {
			res.status(403).json({
				notice: {
					message: 'anyForbiddenError',
					type: 'error',
				},
			});
			return;
		}
		next();
	});

	gatedRouter.use((req, res, next) => {
		const path = typeof req.path === 'string' ? req.path : '';
		if (!path.startsWith('/api/')) {
			next();
			return;
		}
		const requesterIp = typeof req.ip === 'string' ? req.ip : 'unknown';
		const normalizedIp = normalizeIp(requesterIp || 'unknown');
		const isMutation = !isSafeHttpMethod(req.method);
		const rateLimit = isMutation
			? adminApiMutationRateLimitPerMinute
			: adminApiReadRateLimitPerMinute;
		const bucketKey = `admin-api:${isMutation ? 'mutation' : 'read'}:${normalizedIp}`;
		const rate = adminApiRateLimiter.check(bucketKey, rateLimit, adminApiRateLimitWindowMs);
		if (rate.allowed) {
			next();
			return;
		}
		res.setHeader('Retry-After', String(rate.retryAfterSeconds));
		res.setHeader('Cache-Control', 'no-store');
		res.status(429).json({
			notice: {
				message: 'too-many-requests',
				type: 'error',
			},
		});
	});

	gatedRouter.use((req, res, next) => {
		const currentAdmin = (req.session as any)?.adminUser as { role?: string } | undefined;
		const isReadonly = currentAdmin?.role === 'readonly';
		const path = typeof req.path === 'string' ? req.path : '';
		const actionName = path.startsWith('/api/') ? getAdminApiActionNameFromPath(path) : null;
		const isMutation = path.startsWith('/api/')
			? isAdminApiMutationIntent(req.method, actionName)
			: !isSafeHttpMethod(req.method);
		if (isReadonly && isMutation && path.startsWith('/api/')) {
			if (
				req.method.toUpperCase() === 'POST' &&
				actionName &&
				SAFE_READONLY_POST_ACTIONS.has(actionName)
			) {
				next();
				return;
			}

			res.status(403).json({
				notice: {
					message: 'readonly-account-disabled',
					type: 'error',
				},
			});
			return;
		}
		next();
	});
	gatedRouter.use(router);

	app.use(admin.options.rootPath, gatedRouter);
	setupAdminErrorTracking(app);

	bootLog('start(): calling app.listen', { port: adminPort });
	app.listen(adminPort, () => {
		bootLog('start(): listening', { port: adminPort, rootPath: admin.options.rootPath });
		adminLogger.info(
			{ port: adminPort, rootPath: admin.options.rootPath },
			`AdminJS available at http://localhost:${adminPort}${admin.options.rootPath}`,
		);
	});
};

bootLog('module load: end, calling start()');
start().catch((error) => {
	bootLog('start() rejected', {
		message: (error as Error)?.message ?? String(error),
		stack: (error as Error)?.stack,
	});
	adminLogger.fatal({ err: error }, 'Failed to start AdminJS server');
	captureAdminException(error, { area: 'admin-startup' });
	process.exit(1);
});
