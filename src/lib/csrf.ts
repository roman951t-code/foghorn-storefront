export function isSameOriginRequest(request: Request, expectedOrigin: string): boolean {
	const secFetchSite = request.headers.get('sec-fetch-site');
	if (secFetchSite && secFetchSite !== 'same-origin' && secFetchSite !== 'same-site') {
		return false;
	}

	const origin = request.headers.get('origin');
	if (!origin) return false;

	try {
		return new URL(origin).origin === new URL(expectedOrigin).origin;
	} catch {
		return false;
	}
}
