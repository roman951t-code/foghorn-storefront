import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from '@/i18n/routing';
import { APP_URL } from './src/config/env';

const handleI18nRouting = createMiddleware(routing);
const legacyLocaleMap: Record<string, string> = { ua: 'uk', us: 'en' };
const allowedHosts = new Set<string>([
	new URL(APP_URL).host,
	'localhost:3000',
	'127.0.0.1:3000',
]);
const rateLimitStore = new Map<
	string,
	{
		count: number;
		resetAt: number;
	}
>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 80;
const RATE_LIMIT_PATH_PREFIXES = ['/api/auth', '/api/cart'];

const getClientKey = (request: NextRequest) => {
	const forwarded = request.headers.get('x-forwarded-for');
	if (forwarded) {
		const [first] = forwarded.split(',').map((v) => v.trim());
		if (first) return first;
	}
	const realIp = request.headers.get('x-real-ip');
	if (realIp) return realIp;
	return request.headers.get('cf-connecting-ip') || 'unknown';
};

const isRateLimitedPath = (pathname: string) =>
	RATE_LIMIT_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

// Unified middleware: locale routing + CSRF guard for API mutations
export default function middleware(request: NextRequest) {
	const { pathname, search } = request.nextUrl;

	// CSRF/Origin check for API mutations
	if (pathname.startsWith('/api')) {
		// Basic in-memory rate limiting for auth/cart APIs
		if (isRateLimitedPath(pathname)) {
			const key = getClientKey(request);
			const now = Date.now();
			const current = rateLimitStore.get(key);

			if (current && now < current.resetAt) {
				if (current.count >= RATE_LIMIT_MAX) {
					const retryAfter = Math.max(0, Math.ceil((current.resetAt - now) / 1000));
					return new NextResponse('Too Many Requests', {
						status: 429,
						headers: {
							'Retry-After': `${retryAfter}`,
						},
					});
				}
				current.count += 1;
			} else {
				rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
			}
		}

		const { method } = request;
		if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
			return NextResponse.next();
		}

		const originHeader = request.headers.get('origin') ?? request.headers.get('referer');
		if (!originHeader) return NextResponse.next();

		try {
			const host = new URL(originHeader).host;
			if (allowedHosts.has(host)) return NextResponse.next();
		} catch {
			// fall through to deny
		}

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
		return NextResponse.redirect(url, 308);
	}

	// Default i18n routing
	return handleI18nRouting(request);
}

export const config = {
	// Apply to API for CSRF, and to all other app routes (skip _next/static and assets)
	matcher: ['/api/:path*', '/((?!_next|.*\\..*).*)'],
};
