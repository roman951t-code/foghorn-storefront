import { NextResponse } from 'next/server';

const PRIVATE_NO_STORE_HEADERS = {
	'Cache-Control': 'no-store, private',
} as const;

const PRIVATE_NO_CACHE_HEADERS = {
	'Cache-Control': 'private, no-cache, max-age=0, must-revalidate',
} as const;

export function jsonNoStore<T>(body: T, init?: ResponseInit) {
	const headers = new Headers(init?.headers);
	for (const [key, value] of Object.entries(PRIVATE_NO_STORE_HEADERS)) {
		headers.set(key, value);
	}

	return NextResponse.json(body, { ...init, headers });
}

export function jsonPrivateNoCache<T>(body: T, init?: ResponseInit) {
	const headers = new Headers(init?.headers);
	for (const [key, value] of Object.entries(PRIVATE_NO_CACHE_HEADERS)) {
		headers.set(key, value);
	}

	return NextResponse.json(body, { ...init, headers });
}
