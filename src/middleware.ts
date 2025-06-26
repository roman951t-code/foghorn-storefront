// middleware.ts
import { NextRequest } from 'next/server';
import nextIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default function middleware(req: NextRequest) {
	return nextIntlMiddleware(routing)(req);
}

export const config = {
	matcher: ['/', '/(ua|ru)/:path*'],
};
