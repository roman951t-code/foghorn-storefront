// Requests under /.well-known/* (Android Digital Asset Links checks, iOS
// Universal Links preflight, security.txt probes, etc.) used to fall through
// to the [locale]/[...rest] catch-all with `locale` set to the literal string
// ".well-known" — an invalid locale that route's layout correctly rejects via
// notFound(), but that digest-tagged 404 isn't coming back clean under this
// app's Cache Components setup; it surfaces as a 500 instead (see
// src/app/[locale]/layout.tsx). Handling this namespace here, outside the
// [locale] segment entirely, sidesteps that path rather than depending on it.
function wellKnownResponse(path: string[]) {
	if (path.join('/') === 'assetlinks.json') {
		// Empty Digital Asset Links list = "no Android app is associated with
		// this site", which is the correct, valid response — not an error.
		return Response.json([], { headers: { 'Cache-Control': 'public, max-age=3600' } });
	}
	return new Response('Not Found', { status: 404, headers: { 'Cache-Control': 'no-store' } });
}

export function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
	return params.then(({ path }) => wellKnownResponse(path));
}
