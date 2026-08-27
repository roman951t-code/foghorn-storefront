import * as Sentry from '@sentry/nextjs';

export async function register() {
	if (process.env.NEXT_RUNTIME === 'nodejs') {
		await import('../sentry.server.config');
	}

	if (process.env.NEXT_RUNTIME === 'edge') {
		await import('../sentry.edge.config');
	}
}

// Next.js calls onRequestError for every render-time error, including its own
// internal control-flow signals for notFound()/redirect() — those are thrown
// with a NEXT_HTTP_ERROR_FALLBACK/NEXT_REDIRECT digest purely so Next's own
// pipeline can catch them and produce the right response, not real
// application failures. Reporting them to Sentry was the single largest
// source of noise in the dashboard (one recurring 404 alone accounted for
// hundreds of "unhandled" events there).
const isNextInternalControlFlowDigest = (digest: unknown) =>
	typeof digest === 'string' &&
	(digest.startsWith('NEXT_HTTP_ERROR_FALLBACK') || digest.startsWith('NEXT_REDIRECT'));

export const onRequestError = (...args: Parameters<typeof Sentry.captureRequestError>) => {
	const [error] = args;
	if (isNextInternalControlFlowDigest((error as { digest?: unknown } | null)?.digest)) return;
	return Sentry.captureRequestError(...args);
};
