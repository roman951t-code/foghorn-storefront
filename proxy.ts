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

const generateCspNonce = () => {
	const bytes = new Uint8Array(16);
	crypto.getRandomValues(bytes);
	return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

const buildBaseCspDirectives = (nonce: string) => [
	"default-src 'self'",
	`script-src 'self' 'nonce-${nonce}' https://js.stripe.com`,
	"script-src-attr 'none'",
	`style-src 'self' 'nonce-${nonce}' https:`,
	"style-src-attr 'unsafe-inline'",
	"img-src 'self' data: blob: https:",
	"font-src 'self' data:",
	"connect-src 'self' https://api.stripe.com",
	"frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
	"object-src 'none'",
	"base-uri 'self'",
	"form-action 'self'",
	"frame-ancestors 'none'",
	'upgrade-insecure-requests',
];

const buildCspPolicy = (nonce: string) => buildBaseCspDirectives(nonce).join('; ');

const buildCspReportOnlyPolicy = (nonce: string) =>
	[
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

// Unified middleware: locale routing + CSRF guard for API mutations
export default async function middleware(request: NextRequest) {
	const { pathname, search } = request.nextUrl;
	const cspContext = pathname.startsWith('/api') ? null : buildCspContext(request);

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
