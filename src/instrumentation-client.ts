import * as Sentry from '@sentry/nextjs';

const parseSampleRate = (value: string | undefined, fallback: number) => {
	const parsed = Number.parseFloat(value ?? '');
	return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : fallback;
};

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
	Sentry.init({
		dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
		environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
		release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
		tracesSampleRate: parseSampleRate(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE, 0.02),
		replaysSessionSampleRate: parseSampleRate(
			process.env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE,
			0,
		),
		replaysOnErrorSampleRate: parseSampleRate(
			process.env.NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE,
			0.1,
		),
		sendDefaultPii: false,
	});
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
