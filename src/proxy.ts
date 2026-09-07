import type { NextRequest } from 'next/server';
import middleware from '../proxy';

export default function proxy(request: NextRequest) {
	return middleware(request);
}

export const config = {
	// Apply to API for CSRF, and to all other app routes (skip _next/static and assets)
	matcher: ['/api/:path*', '/((?!_next|.*\\..*).*)'],
};
