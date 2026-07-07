import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from '@/i18n/routing';
import { env } from './src/config/env';
import { resolveAllowedAppHosts } from './src/config/appUrl';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

const handleI18nRouting = createMiddleware(routing);
const legacyLocaleMap: Record<string, string> = { ua: 'uk', us: 'en' };
const allowedHosts = new Set<string>(
	resolveAllowedAppHosts({
		env: process.env as Record<string, string | undefined>,
	}),
);
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_DEFAULT_MAX = 80;
const RATE_LIMIT_STRIPE_SESSION_MAX = 12;
const RATE_LIMIT_REVALIDATE_MAX = 18;
const RATE_LIMIT_WEBHOOK_MAX = 120;
const RATE_LIMIT_SESSION_EXTENDED_MAX = 120;
const RATE_LIMIT_WISHLIST_MAX = 120;
const RATE_LIMIT_VIEWED_PRODUCTS_MAX = 120;
const RATE_LIMIT_API_READ_MAX = 180;
const RATE_LIMIT_API_MUTATION_MAX = 90;
const ALLOWED_EXTERNAL_MUTATION_PATHS = new Set<string>([
	'/api/payments/stripe/webhook',
	'/api/security/csp-report',
]);
const REVALIDATE_SECRET_PATTERN = /^[A-Za-z0-9._~-]{24,256}$/;
const CSP_REPORT_GROUP = 'csp-endpoint';
const SAFE_API_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const ALLOWED_CORS_METHODS = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'];

const resolveBooleanEnvFlag = (value: string | undefined, fallback: boolean) => {
	if (typeof value !== 'string') return fallback;
	const normalized = value.trim().toLowerCase();
	if (!normalized) return fallback;
	if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
	if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
	return fallback;
};

type DevCspMode = 'off' | 'report-only' | 'enforce';

const resolveDevCspMode = (): DevCspMode => {
	if (env.NODE_ENV !== 'development') return 'off';
	const normalized = process.env.DEV_CSP_MODE?.trim().toLowerCase();
	if (normalized === 'report-only' || normalized === 'enforce') return normalized;
	return 'off';
};

const LOCAL_HARDENED_PROFILE_ENABLED =
	env.NODE_ENV === 'development' && resolveBooleanEnvFlag(process.env.LOCAL_HARDENED_PROFILE, true);
const BROAD_API_RATE_LIMITS_ENABLED =
	env.NODE_ENV === 'production' || LOCAL_HARDENED_PROFILE_ENABLED;
const DEV_CSP_MODE = resolveDevCspMode();
const LOCAL_PRODUCTION_PREVIEW_ENABLED =
	env.NODE_ENV === 'production' &&
	(env.NEXT_PUBLIC_APP_URL === 'http://localhost:3000' ||
		env.NEXT_PUBLIC_APP_URL === 'http://127.0.0.1:3000' ||
		resolveBooleanEnvFlag(env.LOCAL_NETWORK_PREVIEW, false));
const CSP_ENFORCEMENT_ENABLED =
	(env.NODE_ENV === 'production' && !LOCAL_PRODUCTION_PREVIEW_ENABLED) ||
	DEV_CSP_MODE === 'enforce';
const CSP_REPORT_ONLY_ENABLED =
	(env.NODE_ENV === 'production' &&
		!LOCAL_PRODUCTION_PREVIEW_ENABLED &&
		process.env.CSP_REPORT_ONLY !== 'false') ||
	DEV_CSP_MODE === 'report-only';
const CSP_ENABLED = CSP_ENFORCEMENT_ENABLED || CSP_REPORT_ONLY_ENABLED;

type RateLimitRule = {
	bucket: string;
	limit: number;
	requireDistributedInProduction?: boolean;
	matches: (request: NextRequest) => boolean;
};

type CspContext = {
	policy: string | null;
	reportOnlyPolicy: string | null;
	reportEndpointUrl: string;
	requestHeaders: Headers;
};

const isSafeApiMethod = (method: string) => SAFE_API_METHODS.has(method.toUpperCase());

const BASE_RATE_LIMIT_RULES: RateLimitRule[] = [
	{
		bucket: '/api/auth',
		limit: RATE_LIMIT_DEFAULT_MAX,
		requireDistributedInProduction: true,
		matches: (request) => request.nextUrl.pathname.startsWith('/api/auth'),
	},
	{
		bucket: '/api/cart',
		limit: RATE_LIMIT_DEFAULT_MAX,
		requireDistributedInProduction: true,
		matches: (request) => request.nextUrl.pathname.startsWith('/api/cart'),
	},
	{
		bucket: '/api/payments/stripe',
		limit: RATE_LIMIT_STRIPE_SESSION_MAX,
		requireDistributedInProduction: true,
		matches: (request) => request.nextUrl.pathname === '/api/payments/stripe',
	},
	{
		bucket: '/api/cache/revalidate',
		limit: RATE_LIMIT_REVALIDATE_MAX,
		requireDistributedInProduction: true,
		matches: (request) => request.nextUrl.pathname === '/api/cache/revalidate',
	},
	{
		bucket: '/api/cache/revalidate/windows',
		limit: RATE_LIMIT_REVALIDATE_MAX,
		requireDistributedInProduction: true,
		matches: (request) => request.nextUrl.pathname === '/api/cache/revalidate/windows',
	},
];

const BROAD_API_RATE_LIMIT_RULES: RateLimitRule[] = [
	{
		bucket: '/api/payments/stripe/webhook',
		limit: RATE_LIMIT_WEBHOOK_MAX,
		requireDistributedInProduction: true,
		matches: (request) => request.nextUrl.pathname === '/api/payments/stripe/webhook',
	},
	{
		bucket: '/api/products/wishlist',
		limit: RATE_LIMIT_WISHLIST_MAX,
		matches: (request) => request.nextUrl.pathname === '/api/products/wishlist',
	},
	{
		bucket: '/api/session/extended',
		limit: RATE_LIMIT_SESSION_EXTENDED_MAX,
		matches: (request) => request.nextUrl.pathname === '/api/session/extended',
	},
	{
		bucket: '/api/viewed-products',
		limit: RATE_LIMIT_VIEWED_PRODUCTS_MAX,
		matches: (request) => request.nextUrl.pathname === '/api/viewed-products',
	},
	{
		bucket: '/api/mutation',
		limit: RATE_LIMIT_API_MUTATION_MAX,
		matches: (request) =>
			request.nextUrl.pathname.startsWith('/api') && !isSafeApiMethod(request.method),
	},
	{
		bucket: '/api/read',
		limit: RATE_LIMIT_API_READ_MAX,
		matches: (request) =>
			request.nextUrl.pathname.startsWith('/api') && isSafeApiMethod(request.method),
	},
];

const RATE_LIMIT_RULES = BROAD_API_RATE_LIMITS_ENABLED
	? [...BASE_RATE_LIMIT_RULES, ...BROAD_API_RATE_LIMIT_RULES]
	: BASE_RATE_LIMIT_RULES;

const resolveRateLimitRule = (request: NextRequest): RateLimitRule | null => {
	for (const rule of RATE_LIMIT_RULES) {
		if (rule.matches(request)) return rule;
	}
	return null;
};

const isCacheRevalidatePath = (pathname: string) =>
	pathname === '/api/cache/revalidate' || pathname === '/api/cache/revalidate/windows';

const normalizeSecret = (value: string | null) => {
	if (!value) return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
};

const resolveProvidedRevalidateSecret = (request: NextRequest) => {
	const fromHeader = normalizeSecret(request.headers.get('x-revalidate-secret'));
	if (fromHeader) return fromHeader;

	const authorization = normalizeSecret(request.headers.get('authorization'));
	if (!authorization) return null;
	const match = authorization.match(/^Bearer\s+(.+)$/i);
	if (!match) return null;
	return normalizeSecret(match[1] ?? null);
};

const resolveExpectedRevalidateSecrets = () =>
	Array.from(
		new Set(
			[env.CACHE_REVALIDATE_SECRET, env.CRON_SECRET]
				.map((value) => normalizeSecret(value ?? null))
				.filter((value): value is string => Boolean(value)),
		),
	);

const isAllowedMutationOrigin = (originHeader: string, request: NextRequest) => {
	try {
		const origin = new URL(originHeader);
		if (
			env.NODE_ENV === 'production' &&
			!LOCAL_PRODUCTION_PREVIEW_ENABLED &&
			origin.protocol !== 'https:'
		) {
			return false;
		}
		if (
			env.NODE_ENV !== 'production' &&
			origin.protocol !== 'http:' &&
			origin.protocol !== 'https:'
		) {
			return false;
		}
		// Always allow same-host mutations to avoid false 403s behind multi-domain deployments.
		if (origin.host.toLowerCase() === request.nextUrl.host.toLowerCase()) return true;
		return allowedHosts.has(origin.host.toLowerCase());
	} catch {
		return false;
	}
};

const isAllowedRequestHost = (request: NextRequest) =>
	allowedHosts.has(request.nextUrl.host.toLowerCase());

const isCorsPreflightRequest = (request: NextRequest) =>
	request.method.toUpperCase() === 'OPTIONS' &&
	Boolean(request.headers.get('origin')) &&
	Boolean(request.headers.get('access-control-request-method'));

const buildCorsPreflightResponse = (request: NextRequest) => {
	const originHeader = request.headers.get('origin');
	if (!originHeader || !isAllowedMutationOrigin(originHeader, request)) {
		return new NextResponse('Forbidden', { status: 403, headers: { 'Cache-Control': 'no-store' } });
	}

	const origin = new URL(originHeader);
	const response = new NextResponse(null, { status: 204 });
	response.headers.set('Access-Control-Allow-Origin', origin.origin);
	response.headers.set('Access-Control-Allow-Credentials', 'true');
	response.headers.set('Access-Control-Allow-Methods', ALLOWED_CORS_METHODS.join(', '));
	response.headers.set(
		'Access-Control-Allow-Headers',
		request.headers.get('access-control-request-headers') ??
			'content-type, authorization, x-revalidate-secret',
	);
	response.headers.set('Access-Control-Max-Age', '600');
	response.headers.set(
		'Vary',
		'Origin, Access-Control-Request-Method, Access-Control-Request-Headers',
	);
	response.headers.set('Cache-Control', 'no-store');
	return response;
};

// The nonce must stay identical for every request/response pair served from
// a given deployment. Statically-rendered pages (cacheComponents/ISR) embed
// the nonce in their <script nonce="..."> tags once, at generation time, and
// are then served straight from cache without re-running this middleware's
// render path — but middleware itself still runs on *every* request. A fresh
// random nonce per request would mint a value that never matches what's
// frozen in the cached HTML, and the browser blocks those inline scripts
// (nonce mismatch), even though nothing is actually wrong. Deriving the
// nonce from Vercel's immutable per-deployment commit SHA keeps every
// request/response pair consistent for as long as this deployment is live,
// while still rotating on every new deploy.
const resolveStableCspNonce = () => {
	const deploymentId = process.env.VERCEL_GIT_COMMIT_SHA;
	if (deploymentId) {
		return btoa(deploymentId).replace(/[^A-Za-z0-9+/=]/g, '').slice(0, 32);
	}
	// No stable deployment id (e.g. local dev, where there's no CDN/ISR
	// caching layer to create a mismatch) — a value that's stable for this
	// module's lifetime is enough.
	const bytes = new Uint8Array(16);
	crypto.getRandomValues(bytes);
	return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

const CSP_NONCE = resolveStableCspNonce();
const generateCspNonce = () => CSP_NONCE;

// Google's recommended CSP3 hardening template. The trick is that CSP3-aware
// browsers ignore host-list sources ('self', https:, etc.) inside script-src
// as soon as they see 'strict-dynamic' — they will only trust the nonced
// bootstrap script and scripts it (transitively) loads. Older browsers that
// don't understand 'strict-dynamic' fall back to the legacy sources
// ('unsafe-inline' + https:), so the policy still ships something usable.
// See https://web.dev/articles/strict-csp.
//
// 'unsafe-eval' is required because Sentry's browser SDK uses new Function()
// (Session Replay's CSS-to-matcher compiler, and some source-map parsing).
// Restricting to 'wasm-unsafe-eval' is not enough — the replay build fires
// eval-style code even when replay itself is off. Removing 'unsafe-eval'
// would silently break error/replay reporting in production.
//
// The Sentry ingest hostname is wildcarded (*.sentry.io covers every region:
// standard, .de, .us, ...) so a Sentry project region change never breaks
// error reporting.
const buildBaseCspDirectives = (nonce: string) => [
	"default-src 'self'",
	`script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline' 'unsafe-eval' https: https://js.stripe.com`,
	"script-src-attr 'none'",
	`style-src 'self' 'nonce-${nonce}' https: 'unsafe-inline'`,
	"style-src-attr 'unsafe-inline'",
	"img-src 'self' data: blob: https:",
	"font-src 'self' data:",
	"connect-src 'self' https://api.stripe.com https://*.sentry.io",
	"frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
	"worker-src 'self' blob:",
	"object-src 'none'",
	"base-uri 'self'",
	"form-action 'self'",
	"frame-ancestors 'none'",
];

const buildCspPolicy = (nonce: string) =>
	[...buildBaseCspDirectives(nonce), 'upgrade-insecure-requests'].join('; ');

const buildCspReportOnlyPolicy = (nonce: string) =>
	[
		// upgrade-insecure-requests has no effect in a report-only policy (the
		// browser can't enforce it there) and just produces a harmless-but-
		// noisy console warning, so it's deliberately left out of this variant.
		...buildBaseCspDirectives(nonce),
		'report-uri /api/security/csp-report',
		`report-to ${CSP_REPORT_GROUP}`,
	].join('; ');

const buildCspContext = (request: NextRequest): CspContext | null => {
	if (!CSP_ENABLED) return null;
	const nonce = generateCspNonce();
	const policy = CSP_ENFORCEMENT_ENABLED ? buildCspPolicy(nonce) : null;
	const requestHeaders = new Headers(request.headers);
	if (policy) {
		requestHeaders.set('content-security-policy', policy);
	}
	requestHeaders.set('x-csp-nonce', nonce);
	return {
		policy,
		reportOnlyPolicy: CSP_REPORT_ONLY_ENABLED ? buildCspReportOnlyPolicy(nonce) : null,
		reportEndpointUrl: new URL('/api/security/csp-report', request.url).toString(),
		requestHeaders,
	};
};

const applyRequestHeadersToResponse = (response: NextResponse, requestHeaders: Headers) => {
	const requestOverrideResponse = NextResponse.next({ request: { headers: requestHeaders } });
	for (const [key, value] of requestOverrideResponse.headers.entries()) {
		if (key === 'x-middleware-override-headers' || key.startsWith('x-middleware-request-')) {
			response.headers.set(key, value);
		}
	}
	return response;
};

const applyCspHeaders = (response: NextResponse, cspContext: CspContext | null) => {
	if (!cspContext) return response;
	if (cspContext.policy) {
		response.headers.set('Content-Security-Policy', cspContext.policy);
	}
	if (cspContext.reportOnlyPolicy) {
		response.headers.set('Content-Security-Policy-Report-Only', cspContext.reportOnlyPolicy);
		response.headers.set(
			'Report-To',
			JSON.stringify({
				group: CSP_REPORT_GROUP,
				max_age: 60 * 60 * 24 * 7,
				endpoints: [{ url: cspContext.reportEndpointUrl }],
			}),
		);
	}
	return response;
};

// Path fragments that identify common vulnerability scanners (Nikto, Nessus,
// Nuclei, wpscan, various sec-list mass probes). None of these are legitimate
// URLs in a Next.js + Prisma app, so short-circuiting to a 404 here saves an
// RSC render/DB lookup and denies the scanner useful signal about what stack
// we're running. Match is case-insensitive and matches any URL that CONTAINS
// the fragment (path OR query), so `?file=.env` is also caught.
const EXPLOIT_PROBE_FRAGMENTS: readonly string[] = [
	'/.env',
	'/.git/',
	'/.svn/',
	'/.DS_Store',
	'/wp-admin',
	'/wp-login',
	'/wp-content',
	'/wp-includes',
	'/xmlrpc.php',
	'/phpmyadmin',
	'/phpinfo',
	'/pma/',
	'/sqlmanager',
	'/admin.php',
	'/administrator/',
	'/vendor/phpunit',
	'/.aws/',
	'/.docker/',
	'/.ssh/',
	'/config.json',
	'/composer.json',
	'/composer.lock',
	'/backup.sql',
	'/backup.zip',
	'/database.sql',
	'/dump.sql',
	'.env.production',
	'.env.local',
	'/actuator/',
	'/api/v1/env',
	'/api/v1/secrets',
];

const isExploitProbePath = (pathname: string, search: string) => {
	const haystack = (pathname + search).toLowerCase();
	for (const fragment of EXPLOIT_PROBE_FRAGMENTS) {
		if (haystack.includes(fragment)) return true;
	}
	// Path traversal attempts, including percent-encoded ones, on any route.
	if (haystack.includes('..%2f') || haystack.includes('%2e%2e/') || haystack.includes('/../')) {
		return true;
	}
	return false;
};

// Upper bound for the length of the URL + query string. Real storefront URLs
// (including deeply-filtered category listings) never approach this — buffer
// overflow / ReDoS probes routinely do.
const MAX_URL_LENGTH = 4096;
// Upper bound for the declared request body size. Next.js has its own default
// (~4 MB) but declaring an explicit ceiling short-circuits obvious garbage
// before it even reaches the route handler.
const MAX_REQUEST_BODY_BYTES = 4 * 1024 * 1024;

// Unified middleware: locale routing + CSRF guard for API mutations, plus a
// small code-level WAF layer sitting above Vercel/Render's platform-level
// DDoS protection. See docs/universal-app-doc.md for the full rationale.
export default async function middleware(request: NextRequest) {
	const { pathname, search } = request.nextUrl;
	const cspContext = pathname.startsWith('/api') ? null : buildCspContext(request);

	// Fast 404 for vulnerability-scanner probes. Placed before host allowlist so
	// the scanner never learns whether its Host header matched — same 404 for
	// wrong host or probe URL, no fingerprinting signal.
	if (isExploitProbePath(pathname, search)) {
		return new NextResponse('Not Found', {
			status: 404,
			headers: { 'Cache-Control': 'no-store' },
		});
	}

	// Absurdly long URL — reject before any downstream regex/router work.
	if (request.nextUrl.href.length > MAX_URL_LENGTH) {
		return new NextResponse('URI Too Long', {
			status: 414,
			headers: { 'Cache-Control': 'no-store' },
		});
	}

	// Declared body over the ceiling — no route in this app expects this much.
	// The Stripe webhook posts JSON well under 100 KB; catalog imports go
	// through the AdminJS host, not this middleware.
	const contentLengthHeader = request.headers.get('content-length');
	if (contentLengthHeader) {
		const declaredLength = Number.parseInt(contentLengthHeader, 10);
		if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BODY_BYTES) {
			return new NextResponse('Payload Too Large', {
				status: 413,
				headers: { 'Cache-Control': 'no-store' },
			});
		}
	}

	if (
		env.NODE_ENV === 'production' &&
		!LOCAL_PRODUCTION_PREVIEW_ENABLED &&
		!isAllowedRequestHost(request)
	) {
		return new NextResponse('Not Found', {
			status: 404,
			headers: { 'Cache-Control': 'no-store' },
		});
	}

	// CSRF/Origin check for API mutations
	if (pathname.startsWith('/api')) {
		if (isCorsPreflightRequest(request)) {
			return buildCorsPreflightResponse(request);
		}

		// Shared rate limiting (Upstash when configured, in-memory fallback otherwise).
		const rateLimitRule = resolveRateLimitRule(request);
		if (rateLimitRule) {
			const clientIp = getClientIp(request);
			const rate = await checkRateLimit({
				key: `proxy:${rateLimitRule.bucket}:${clientIp}`,
				limit: rateLimitRule.limit,
				windowMs: RATE_LIMIT_WINDOW_MS,
				requireDistributedInProduction: rateLimitRule.requireDistributedInProduction,
			});
			if (!rate.allowed) {
				const status = rate.statusCode ?? 429;
				const message = status === 503 ? 'Service Unavailable' : 'Too Many Requests';
				return new NextResponse(message, {
					status,
					headers: {
						'Retry-After': String(rate.retryAfterSeconds),
						'Cache-Control': 'no-store',
					},
				});
			}
		}

		const { method } = request;
		if (isCacheRevalidatePath(pathname)) {
			const expectedSecrets = resolveExpectedRevalidateSecrets();
			if (expectedSecrets.length === 0) {
				return new NextResponse('Service Unavailable', { status: 503 });
			}
			const providedSecret = resolveProvidedRevalidateSecret(request);
			const hasValidSecretFormat =
				typeof providedSecret === 'string' && REVALIDATE_SECRET_PATTERN.test(providedSecret);
			if (!hasValidSecretFormat) {
				return new NextResponse('Unauthorized', { status: 401 });
			}
			if (!expectedSecrets.includes(providedSecret)) {
				return new NextResponse('Unauthorized', { status: 401 });
			}
			return NextResponse.next();
		}
		if (isSafeApiMethod(method)) {
			return NextResponse.next();
		}
		if (ALLOWED_EXTERNAL_MUTATION_PATHS.has(pathname)) {
			return NextResponse.next();
		}

		const originHeader = request.headers.get('origin') ?? request.headers.get('referer');
		if (!originHeader) {
			return new NextResponse('Forbidden', { status: 403 });
		}

		if (isAllowedMutationOrigin(originHeader, request)) return NextResponse.next();

		return new NextResponse('Forbidden', { status: 403 });
	}

	// Legacy locale redirect support (e.g., /ua -> /uk)
	const [, maybeLocale, ...rest] = pathname.split('/');
	if (maybeLocale && legacyLocaleMap[maybeLocale]) {
		const redirectedPath = ['/', legacyLocaleMap[maybeLocale], ...rest]
			.join('/')
			.replace(/\/+/g, '/');
		const url = new URL(redirectedPath, request.url);
		url.search = search;
		const response = NextResponse.redirect(url, 308);
		return applyCspHeaders(response, cspContext);
	}

	// Default i18n routing
	const i18nResponse = handleI18nRouting(request);
	const responseWithRequestHeaders = cspContext
		? applyRequestHeadersToResponse(i18nResponse, cspContext.requestHeaders)
		: i18nResponse;
	return applyCspHeaders(responseWithRequestHeaders, cspContext);
}

export const config = {
	// Apply to API for CSRF, and to all other app routes (skip _next/static and assets)
	matcher: ['/api/:path*', '/((?!_next|.*\\..*).*)'],
};
