import * as Sentry from '@sentry/nextjs';

const parseSampleRate = (value: string | undefined, fallback: number) => {
	const parsed = Number.parseFloat(value ?? '');
	return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : fallback;
};

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
	Sentry.init({
		dsn,
		// NOT falling back to NODE_ENV: `next start` sets it to 'production'
		// unconditionally, on a laptop just as much as on Vercel, which was
		// mislabeling local production-build test runs as real prod traffic in
		// Sentry. VERCEL_ENV is only ever present on an actual Vercel deployment.
		environment: process.env.SENTRY_ENVIRONMENT ?? process.env.VERCEL_ENV ?? 'development',
		release: process.env.SENTRY_RELEASE ?? process.env.VERCEL_GIT_COMMIT_SHA,
		tracesSampleRate: parseSampleRate(process.env.SENTRY_TRACES_SAMPLE_RATE, 0.05),
		sendDefaultPii: false,
	});
}
