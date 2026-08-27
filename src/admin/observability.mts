import crypto from 'node:crypto';
import type express from 'express';
import * as Sentry from '@sentry/node';
import pino from 'pino';
import pinoHttp from 'pino-http';

const LOG_LEVELS = new Set(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']);

const normalizeOptionalEnvValue = (value: string | undefined) => {
	if (typeof value !== 'string') return undefined;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
};

const parseSampleRate = (value: string | undefined, fallback: number) => {
	const parsed = Number.parseFloat(value ?? '');
	return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : fallback;
};

const resolveLogLevel = () => {
	const configured = normalizeOptionalEnvValue(
		process.env.ADMIN_LOG_LEVEL ?? process.env.LOG_LEVEL,
	);
	if (configured && LOG_LEVELS.has(configured)) return configured;
	return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
};

const adminSentryDsn =
	normalizeOptionalEnvValue(process.env.ADMIN_SENTRY_DSN) ??
	normalizeOptionalEnvValue(process.env.SENTRY_DSN);
const adminEnvironment =
	normalizeOptionalEnvValue(process.env.SENTRY_ENVIRONMENT) ??
	normalizeOptionalEnvValue(process.env.RENDER_SERVICE_NAME) ??
	process.env.NODE_ENV ??
	'development';
const adminRelease =
	normalizeOptionalEnvValue(process.env.SENTRY_RELEASE) ??
	normalizeOptionalEnvValue(process.env.RENDER_GIT_COMMIT) ??
	normalizeOptionalEnvValue(process.env.VERCEL_GIT_COMMIT_SHA);

export const adminLogger = pino({
	level: resolveLogLevel(),
	base: {
		service: 'admin',
		environment: adminEnvironment,
		release: adminRelease,
	},
	redact: {
		paths: [
			'req.headers.authorization',
			'req.headers.cookie',
			'req.headers["set-cookie"]',
			'res.headers["set-cookie"]',
			'password',
			'*.password',
			'*.token',
			'*.secret',
		],
		remove: true,
	},
});

if (adminSentryDsn) {
	Sentry.init({
		dsn: adminSentryDsn,
		environment: adminEnvironment,
		release: adminRelease,
		integrations: [Sentry.expressIntegration(), Sentry.pinoIntegration()],
		tracesSampleRate: parseSampleRate(process.env.ADMIN_SENTRY_TRACES_SAMPLE_RATE, 0.05),
		sendDefaultPii: false,
	});
}

export const adminHttpLogger = pinoHttp({
	logger: adminLogger,
	genReqId: (req, res) => {
		const existingId = req.headers['x-request-id'];
		const requestId = Array.isArray(existingId) ? existingId[0] : existingId;
		const id = requestId || crypto.randomUUID();
		res.setHeader('X-Request-Id', id);
		return id;
	},
	autoLogging: {
		ignore: (req) => req.url === '/healthz',
	},
	customLogLevel: (_req, res, error) => {
		if (error || res.statusCode >= 500) return 'error';
		if (res.statusCode >= 400) return 'warn';
		return 'info';
	},
	customSuccessMessage: (req, res) => `${req.method} ${req.url} ${res.statusCode}`,
	customErrorMessage: (req, res, error) =>
		`${req.method} ${req.url} ${res.statusCode} ${error.message}`,
});

export const captureAdminException = (error: unknown, tags?: Record<string, string>) => {
	if (!Sentry.isEnabled()) return;
	Sentry.withScope((scope) => {
		for (const [key, value] of Object.entries(tags ?? {})) {
			scope.setTag(key, value);
		}
		Sentry.captureException(error);
	});
};

export const setupAdminErrorTracking = (app: express.Express) => {
	if (!Sentry.isEnabled()) return;
	Sentry.setupExpressErrorHandler(app);
};
