import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from '@/i18n/routing';

const handleI18nRouting = createMiddleware(routing);
const legacyLocaleMap: Record<string, string> = { ua: 'uk', us: 'en' };

export default function middleware(request: NextRequest) {
	const { pathname, search } = request.nextUrl;
	const [, maybeLocale, ...rest] = pathname.split('/');

	if (maybeLocale && legacyLocaleMap[maybeLocale]) {
		const redirectedPath = ['/', legacyLocaleMap[maybeLocale], ...rest].join('/').replace(/\/+/g, '/');
		const url = new URL(redirectedPath, request.url);
		url.search = search;
		return NextResponse.redirect(url, 308);
	}

	return handleI18nRouting(request);
}

export const config = {
	// Skip static files and API routes
	matcher: ['/((?!api|_next|.*\\..*).*)'],
};
