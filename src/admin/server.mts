import 'dotenv/config';
import crypto from 'node:crypto';
import express from 'express';
import session from 'express-session';
import admin from './admin.mts';
import { createAdminSessionStore } from './pg-session-store.mts';
import { prisma } from './prisma.mts';
import { verifyServerFetchUrl } from './utils/server-fetch-safety.mts';

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
	nodeEnv === 'production' ? 'enforce' : 'off'
);
const adminApiReadRateLimitPerMinute = parsePositiveInt(
	process.env.ADMIN_API_READ_RATE_LIMIT_PER_MINUTE,
	180
);
const adminApiMutationRateLimitPerMinute = parsePositiveInt(
	process.env.ADMIN_API_MUTATION_RATE_LIMIT_PER_MINUTE,
	90
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

type AdminThumbRateState = {
	count: number;
	resetAt: number;
};
type AdminApiRateState = {
	count: number;
	resetAt: number;
};
const adminThumbRateBuckets = new Map<string, AdminThumbRateState>();
const adminApiRateBuckets = new Map<string, AdminApiRateState>();
const ADMIN_THUMB_RATE_LIMIT_WINDOW_MS = 60_000;
const ADMIN_THUMB_BUCKET_CLEANUP_INTERVAL_MS = 60_000;
const ADMIN_THUMB_MAX_FALLBACK_BUCKETS = 8_000;
const ADMIN_API_BUCKET_CLEANUP_INTERVAL_MS = 60_000;
const ADMIN_API_MAX_FALLBACK_BUCKETS = 12_000;
let adminThumbCleanupTimer: ReturnType<typeof setInterval> | null = null;
let adminApiCleanupTimer: ReturnType<typeof setInterval> | null = null;

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

const pruneExpiredAdminApiBuckets = (now = Date.now()) => {
	for (const [bucketKey, state] of adminApiRateBuckets) {
		if (now >= state.resetAt) {
			adminApiRateBuckets.delete(bucketKey);
		}
	}
};

const trimOldestAdminApiBuckets = (maxEntries: number) => {
	if (adminApiRateBuckets.size <= maxEntries) return;
	const overflow = adminApiRateBuckets.size - maxEntries;
	for (let i = 0; i < overflow; i += 1) {
		const oldestKey = adminApiRateBuckets.keys().next().value as string | undefined;
		if (!oldestKey) break;
		adminApiRateBuckets.delete(oldestKey);
	}
};

const ensureAdminApiCleanupLoop = () => {
	if (adminApiCleanupTimer) return;
	adminApiCleanupTimer = setInterval(() => {
		pruneExpiredAdminApiBuckets();
		trimOldestAdminApiBuckets(ADMIN_API_MAX_FALLBACK_BUCKETS);
	}, ADMIN_API_BUCKET_CLEANUP_INTERVAL_MS);
	(adminApiCleanupTimer as { unref?: () => void }).unref?.();
};

const checkAdminApiRateLimit = (key: string, limit: number, windowMs: number) => {
	const now = Date.now();
	pruneExpiredAdminApiBuckets(now);
	trimOldestAdminApiBuckets(ADMIN_API_MAX_FALLBACK_BUCKETS);
	const existing = adminApiRateBuckets.get(key);
	if (!existing || now >= existing.resetAt) {
		adminApiRateBuckets.set(key, {
			count: 1,
			resetAt: now + windowMs,
		});
		return { allowed: true as const };
	}
	if (existing.count >= limit) {
		return {
			allowed: false as const,
			retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
		};
	}
	existing.count += 1;
	return { allowed: true as const };
};

const resolveAdminMutationOriginHeader = (req: express.Request) =>
	req.get('origin') ?? req.get('referer') ?? null;

const resolveRequestHosts = (req: express.Request) => {
	const hosts = new Set<string>();
	const rawHostHeaders = [req.get('host') ?? '', req.get('x-forwarded-host') ?? ''];
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

type AdminApiContext = {
	resourceId?: string;
	recordId?: string;
};

const NOTICE_RECORD_NOT_FOUND_IN_RESOURCE =
	/^Record with given id: "([^"]+)" cannot be found in resource "([^"]+)"$/;
const NOTICE_BULK_RECORD_NOT_FOUND_IN_RESOURCE =
	/^record with given id: "([^"]+)" cannot be found in resource "([^"]+)"$/;
const NOTICE_RESOURCE_NOT_FOUND = /^Resource of given id: "([^"]+)" cannot be found$/;
const NOTICE_RESOURCE_ACTION_NOT_FOUND =
	/^Resource of given id: "([^"]+)" does not have an action with name: "([^"]+)" or you are not authorized to use it!?$/;
const NOTICE_RESOURCE_RECORD_NOT_FOUND =
	/^Resource of given id: "([^"]+)" does not have a record with id: "([^"]+)" or you are not authorized to use it!?$/;
const NOTICE_RECORD_NOT_FOUND_BY_ID_ONLY = /^Record of given id \("([^"]+)"\) could not be found$/;

const safeDecodeURIComponent = (value: string) => {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
};

const getAdminApiContextFromPath = (path: string): AdminApiContext => {
	const recordActionMatch = path.match(/^\/api\/resources\/([^/]+)\/records\/([^/]+)\/[^/]+$/);
	if (recordActionMatch) {
		return {
			resourceId: safeDecodeURIComponent(recordActionMatch[1]),
			recordId: safeDecodeURIComponent(recordActionMatch[2]),
		};
	}
	const bulkActionMatch = path.match(/^\/api\/resources\/([^/]+)\/bulk\/[^/]+$/);
	if (bulkActionMatch) {
		return {
			resourceId: safeDecodeURIComponent(bulkActionMatch[1]),
		};
	}
	const resourceActionMatch = path.match(/^\/api\/resources\/([^/]+)\/actions\/[^/]+$/);
	if (resourceActionMatch) {
		return {
			resourceId: safeDecodeURIComponent(resourceActionMatch[1]),
		};
	}
	return {};
};

const getAdminApiActionNameFromPath = (path: string) => {
	const matchResourceAction = path.match(/^\/api\/resources\/[^/]+\/actions\/([^/]+)$/);
	const matchRecordAction = path.match(/^\/api\/resources\/[^/]+\/records\/[^/]+\/([^/]+)$/);
	const matchBulkAction = path.match(/^\/api\/resources\/[^/]+\/bulk\/([^/]+)$/);
	const actionName = matchResourceAction?.[1] ?? matchRecordAction?.[1] ?? matchBulkAction?.[1];
	return actionName ? safeDecodeURIComponent(actionName) : null;
};

const isAdminApiMutationIntent = (method: string, actionName: string | null) => {
	if (!isSafeHttpMethod(method)) return true;
	return actionName ? MUTATING_ADMIN_ACTIONS.has(actionName) : false;
};

const replaceNoticeMessage = (
	notice: Record<string, unknown>,
	message: string,
	options: Record<string, unknown> = {}
): Record<string, unknown> => {
	const existingOptions =
		typeof notice.options === 'object' && notice.options !== null
			? (notice.options as Record<string, unknown>)
			: {};
	const mergedOptions = { ...existingOptions, ...options };
	return {
		...notice,
		message,
		...(Object.keys(mergedOptions).length > 0 ? { options: mergedOptions } : {}),
	};
};

const normalizeAdminNotice = (noticeValue: unknown, context: AdminApiContext): unknown => {
	if (!noticeValue || typeof noticeValue !== 'object') return noticeValue;
	const notice = noticeValue as Record<string, unknown>;
	const message = typeof notice.message === 'string' ? notice.message.trim() : '';
	if (!message) return noticeValue;

	if (
		message === 'You have to pass recordId to the recordAction' ||
		message === 'You have to pass "recordId" to Delete Action'
	) {
		return replaceNoticeMessage(notice, 'admin-record-id-required');
	}

	if (message === 'You have to pass a valid recordId to the recordAction') {
		return replaceNoticeMessage(notice, 'admin-record-id-invalid');
	}

	if (message === 'You have to pass "recordIds" to the bulkAction via search params: ?recordIds=...') {
		return replaceNoticeMessage(notice, 'admin-record-ids-required');
	}

	if (message === 'no records were selected.') {
		return replaceNoticeMessage(notice, 'noRecordsSelected');
	}

	let match = message.match(NOTICE_RECORD_NOT_FOUND_IN_RESOURCE);
	if (match) {
		return replaceNoticeMessage(notice, 'error404Record', {
			recordId: match[1],
			resourceId: match[2],
		});
	}

	match = message.match(NOTICE_BULK_RECORD_NOT_FOUND_IN_RESOURCE);
	if (match) {
		return replaceNoticeMessage(notice, 'error404Record', {
			recordId: match[1],
			resourceId: match[2],
		});
	}

	match = message.match(NOTICE_RESOURCE_NOT_FOUND);
	if (match) {
		return replaceNoticeMessage(notice, 'error404Resource', { resourceId: match[1] });
	}

	match = message.match(NOTICE_RESOURCE_ACTION_NOT_FOUND);
	if (match) {
		return replaceNoticeMessage(notice, 'error404Action', {
			resourceId: match[1],
			actionName: match[2],
		});
	}

	match = message.match(NOTICE_RESOURCE_RECORD_NOT_FOUND);
	if (match) {
		return replaceNoticeMessage(notice, 'error404Record', {
			resourceId: match[1],
			recordId: match[2],
		});
	}

	match = message.match(NOTICE_RECORD_NOT_FOUND_BY_ID_ONLY);
	if (match) {
		return replaceNoticeMessage(notice, 'error404Record', {
			resourceId: context.resourceId ?? '',
			recordId: match[1],
		});
	}

	return noticeValue;
};

const normalizeAdminApiNoticeResponse = (payload: unknown, context: AdminApiContext): unknown => {
	if (!payload || typeof payload !== 'object') return payload;
	const responseBody = payload as Record<string, unknown>;
	const normalizedNotice = normalizeAdminNotice(responseBody.notice, context);
	if (normalizedNotice === responseBody.notice) return payload;
	return {
		...responseBody,
		notice: normalizedNotice,
	};
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
	if (explicitCookiePassword && !hasStrongSecret(explicitCookiePassword, 24)) {
		throw new Error(
			'ADMINJS_COOKIE_PASSWORD must be a strong secret (minimum 24 characters and not a common default).'
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
	app.use(admin.options.rootPath, createAdminCspMiddleware(adminCspMode));
	if (nodeEnv === 'production') {
		// Required when secure cookies are used behind TLS-terminating proxies.
		app.set('trust proxy', 1);
	}
	ensureAdminThumbCleanupLoop();
	ensureAdminApiCleanupLoop();
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

	app.use(express.static('public'));

	const storeAppUrl =
		process.env.ADMIN_THUMBNAIL_APP_URL ??
		(nodeEnv !== 'production'
			? 'http://localhost:3000'
			: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000');
	const storeAppOriginUrl = new URL(storeAppUrl);
	if (nodeEnv === 'production') {
		const storeUrlSafety = await verifyServerFetchUrl(storeAppOriginUrl);
		if (!storeUrlSafety.ok) {
			throw new Error(
				`ADMIN_THUMBNAIL_APP_URL/NEXT_PUBLIC_APP_URL is not safe for server-side fetches: ${storeUrlSafety.reason}`
			);
		}
	}
	const allowedThumbHosts = new Set(
		[
			storeAppOriginUrl.hostname,
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
	const allowAnyThumbHost =
		nodeEnv !== 'production' && process.env.ADMIN_THUMBNAIL_ALLOW_ANY_HOST === 'true';
	const isConfiguredStoreUrl = (url: URL) => url.origin === storeAppOriginUrl.origin;
	const allowsPrivateThumbnailUrl = (url: URL) =>
		nodeEnv !== 'production' && isConfiguredStoreUrl(url);
	const verifyThumbnailUrl = async (url: URL) => {
		if (url.protocol !== 'http:' && url.protocol !== 'https:') {
			return false;
		}
		if (isConfiguredStoreUrl(url) && (url.pathname === '/_next/image' || url.pathname.startsWith('/api/'))) {
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

		if (!(await verifyThumbnailUrl(targetUrl))) {
			res.status(400).send('URL not allowed');
			return;
		}

		const w = Math.max(16, Math.min(1024, Number(widthParam) || 256));
		const q = Math.max(10, Math.min(90, Number(qualityParam) || 70));

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
		const rateLimit = isMutation ? adminApiMutationRateLimitPerMinute : adminApiReadRateLimitPerMinute;
		const bucketKey = `admin-api:${isMutation ? 'mutation' : 'read'}:${normalizedIp}`;
		const rate = checkAdminApiRateLimit(bucketKey, rateLimit, adminApiRateLimitWindowMs);
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
			if (req.method.toUpperCase() === 'POST' && actionName && SAFE_READONLY_POST_ACTIONS.has(actionName)) {
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

	app.listen(adminPort, () => {
		console.log(`AdminJS available at http://localhost:${adminPort}${admin.options.rootPath}`);
	});
};

start().catch((error) => {
	console.error('Failed to start AdminJS server', error);
	process.exit(1);
});
