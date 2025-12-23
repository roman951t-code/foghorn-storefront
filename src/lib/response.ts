import { NextResponse } from 'next/server';

export const PRIVATE_NO_STORE_HEADERS = {
	'Cache-Control': 'no-store, private',
} as const;

export function jsonNoStore<T>(body: T, init?: ResponseInit) {
	const headers = new Headers(init?.headers);
	for (const [key, value] of Object.entries(PRIVATE_NO_STORE_HEADERS)) {
		headers.set(key, value);
	}

	return NextResponse.json(body, { ...init, headers });
}
