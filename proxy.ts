import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from '@/i18n/routing';
import { APP_URL, env } from './src/config/env';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

const handleI18nRouting = createMiddleware(routing);
const legacyLocaleMap: Record<string, string> = { ua: 'uk', us: 'en' };
const allowedHosts = new Set<string>([
	new URL(APP_URL).host,
	'localhost:3000',
	'127.0.0.1:3000',
]);
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_DEFAULT_MAX = 80;
const RATE_LIMIT_STRIPE_SESSION_MAX = 12;
const ALLOWED_EXTERNAL_MUTATION_PATHS = new Set<string>([
	'/api/payments/stripe/webhook',
	'/api/security/csp-report',
]);
const REVALIDATE_SECRET_PATTERN = /^[A-Za-z0-9._~-]{24,256}$/;
const CSP_REPORT_GROUP = 'csp-endpoint';
const CSP_ENFORCEMENT_ENABLED = env.NODE_ENV === 'production';
const CSP_REPORT_ONLY_ENABLED = CSP_ENFORCEMENT_ENABLED && process.env.CSP_REPORT_ONLY !== 'false';

type RateLimitRule = {
	bucket: string;
	limit: number;
	requireDistributedInProduction?: boolean;
	matches: (pathname: string) => boolean;
};

type CspContext = {
	policy: string;
	reportOnlyPolicy: string | null;
	reportEndpointUrl: string;
	requestHeaders: Headers;
};

const RATE_LIMIT_RULES: RateLimitRule[] = [
	{
		bucket: '/api/auth',
		limit: RATE_LIMIT_DEFAULT_MAX,
		requireDistributedInProduction: true,
		matches: (pathname) => pathname.startsWith('/api/auth'),
	},
	{
		bucket: '/api/cart',
		limit: RATE_LIMIT_DEFAULT_MAX,
		requireDistributedInProduction: true,
		matches: (pathname) => pathname.startsWith('/api/cart'),
	},
	{
		bucket: '/api/payments/stripe',
		limit: RATE_LIMIT_STRIPE_SESSION_MAX,
		requireDistributedInProduction: true,
		matches: (pathname) => pathname === '/api/payments/stripe',
	},
];

const resolveRateLimitRule = (pathname: string): RateLimitRule | null => {
	for (const rule of RATE_LIMIT_RULES) {
		if (rule.matches(pathname)) return rule;
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
				.filter((value): value is string => Boolean(value))
			)
		);

const isAllowedMutationOrigin = (originHeader: string, request: NextRequest) => {
	try {
		const origin = new URL(originHeader);
		// Always allow same-host mutations to avoid false 403s behind multi-domain deployments.
		if (origin.host === request.nextUrl.host) return true;
		return allowedHosts.has(origin.host);
	} catch {
		return false;
	}
};

const generateCspNonce = () => {
	const bytes = new Uint8Array(16);
	crypto.getRandomValues(bytes);
	return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

const buildBaseCspDirectives = (nonce: string) =>
	[
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
	if (!CSP_ENFORCEMENT_ENABLED) return null;
	const nonce = generateCspNonce();
	const policy = buildCspPolicy(nonce);
	const requestHeaders = new Headers(request.headers);
	requestHeaders.set('content-security-policy', policy);
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
	response.headers.set('Content-Security-Policy', cspContext.policy);
	if (cspContext.reportOnlyPolicy) {
		response.headers.set('Content-Security-Policy-Report-Only', cspContext.reportOnlyPolicy);
		response.headers.set(
			'Report-To',
			JSON.stringify({
				group: CSP_REPORT_GROUP,
				max_age: 60 * 60 * 24 * 7,
				endpoints: [{ url: cspContext.reportEndpointUrl }],
			})
		);
	}
	return response;
};

// Unified middleware: locale routing + CSRF guard for API mutations
export default async function middleware(request: NextRequest) {
	const { pathname, search } = request.nextUrl;
	const cspContext = pathname.startsWith('/api') ? null : buildCspContext(request);

	// CSRF/Origin check for API mutations
	if (pathname.startsWith('/api')) {
		// Shared rate limiting (Upstash when configured, in-memory fallback otherwise).
		const rateLimitRule = resolveRateLimitRule(pathname);
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
		if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
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
