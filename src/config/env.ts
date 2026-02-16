import { z } from 'zod';

const LOCAL_APP_URL = 'http://localhost:3000';
const ENCRYPTION_KEY_HEX_256_REGEX = /^[0-9a-fA-F]{64}$/;
const MIN_BETTER_AUTH_SECRET_LENGTH = 32;

const normalizeOptionalEnvValue = (value: string | undefined) => {
	if (typeof value !== 'string') return undefined;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
};

const normalizeAppUrl = (raw: string | undefined): string | null => {
	if (!raw) return null;
	const trimmed = raw.trim();
	if (!trimmed) return null;
	try {
		const parsed = new URL(trimmed);
		if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
		return parsed.origin;
	} catch {
		return null;
	}
};

const isLocalhostOrigin = (origin: string) => {
	try {
		const url = new URL(origin);
		return url.hostname === 'localhost' || url.hostname === '127.0.0.1';
	} catch {
		return false;
	}
};

const throwInvalidEnvironmentVariables = (
	fieldErrors: Record<string, string[] | undefined>
): never => {
	console.error('Invalid environment variables', fieldErrors);
	throw new Error('Invalid environment variables');
};

const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
	DATABASE_URL: z.string().url({ message: 'DATABASE_URL must be a valid url' }),
	RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
	BETTER_AUTH_SECRET: z.string().optional().transform(normalizeOptionalEnvValue),
	STRIPE_SECRET_KEY: z.string().optional().transform(normalizeOptionalEnvValue),
	STRIPE_WEBHOOK_SECRET: z
		.string()
		.optional()
		.transform(normalizeOptionalEnvValue),
	STRIPE_CURRENCY: z.string().min(1).default('usd'),
	GOOGLE_CLIENT_ID: z.string().optional(),
	GOOGLE_CLIENT_SECRET: z.string().optional(),
	NEXT_PUBLIC_APP_URL: z.string().url().optional(),
	NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
	ENCRYPTION_KEY: z.string().optional().transform(normalizeOptionalEnvValue),
	EMAIL_FROM: z.string().optional().transform(normalizeOptionalEnvValue),
	UPSTASH_REDIS_REST_URL: z.string().url().optional(),
	UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
	CACHE_REVALIDATE_SECRET: z.string().optional(),
	CRON_SECRET: z.string().optional(),
	CACHE_REVALIDATE_ALERT_WEBHOOK_URL: z.string().url().optional(),
	OPS_ALERT_WEBHOOK_URL: z.string().url().optional(),
	CSP_REPORT_ONLY: z
		.string()
		.optional()
		.transform((value) => (value == null ? undefined : value)),
});

const parsedResult = envSchema.safeParse({
	...process.env,
	STRIPE_CURRENCY: process.env.STRIPE_CURRENCY ?? 'usd',
});

const parsedData = parsedResult.success
	? parsedResult.data
	: throwInvalidEnvironmentVariables(parsedResult.error.flatten().fieldErrors);

const normalizedAppUrl = normalizeAppUrl(parsedData.NEXT_PUBLIC_APP_URL);
const additionalFieldErrors: Record<string, string[]> = {};
const environmentWarnings: string[] = [];

if (parsedData.NODE_ENV === 'production' && !parsedData.CACHE_REVALIDATE_SECRET) {
	additionalFieldErrors.CACHE_REVALIDATE_SECRET = [
		'CACHE_REVALIDATE_SECRET is required in production',
	];
}

if (parsedData.NODE_ENV === 'production' && !parsedData.ENCRYPTION_KEY) {
	additionalFieldErrors.ENCRYPTION_KEY = ['ENCRYPTION_KEY is required in production'];
}

if (parsedData.NODE_ENV === 'production' && !parsedData.BETTER_AUTH_SECRET) {
	additionalFieldErrors.BETTER_AUTH_SECRET = ['BETTER_AUTH_SECRET is required in production'];
}

if (
	parsedData.BETTER_AUTH_SECRET &&
	parsedData.BETTER_AUTH_SECRET.length < MIN_BETTER_AUTH_SECRET_LENGTH
) {
	additionalFieldErrors.BETTER_AUTH_SECRET = [
		`BETTER_AUTH_SECRET must be at least ${MIN_BETTER_AUTH_SECRET_LENGTH} characters long`,
	];
}

if (
	parsedData.NODE_ENV === 'production' &&
	parsedData.EMAIL_FROM &&
	parsedData.EMAIL_FROM.toLowerCase().includes('@resend.dev')
) {
	environmentWarnings.push(
		'EMAIL_FROM uses @resend.dev in production. Switch to a verified sender domain before launch.'
	);
}

if (parsedData.ENCRYPTION_KEY && !ENCRYPTION_KEY_HEX_256_REGEX.test(parsedData.ENCRYPTION_KEY)) {
	additionalFieldErrors.ENCRYPTION_KEY = [
		'ENCRYPTION_KEY must be a 64-character hexadecimal string (32 bytes)',
	];
}

if (parsedData.NODE_ENV === 'production' && !normalizedAppUrl) {
	additionalFieldErrors.NEXT_PUBLIC_APP_URL = ['NEXT_PUBLIC_APP_URL is required in production'];
}

if (
	parsedData.NODE_ENV === 'production' &&
	normalizedAppUrl &&
	normalizedAppUrl.startsWith('http://') &&
	!isLocalhostOrigin(normalizedAppUrl)
) {
	additionalFieldErrors.NEXT_PUBLIC_APP_URL = [
		'NEXT_PUBLIC_APP_URL must use https:// in production',
	];
}

if (Object.keys(additionalFieldErrors).length > 0) {
	throwInvalidEnvironmentVariables(additionalFieldErrors);
}

if (parsedData.NODE_ENV === 'production' && !parsedData.EMAIL_FROM) {
	environmentWarnings.push(
		'EMAIL_FROM is not configured in production. Using fallback sender Online Store <onboarding@resend.dev>.'
	);
}

if (
	parsedData.NODE_ENV === 'production' &&
	parsedData.STRIPE_SECRET_KEY &&
	!parsedData.STRIPE_WEBHOOK_SECRET
) {
	environmentWarnings.push(
		'STRIPE_WEBHOOK_SECRET is not configured while STRIPE_SECRET_KEY is set. /api/payments/stripe/webhook will return stripe_webhook_not_configured.'
	);
}

if (environmentWarnings.length > 0) {
	console.warn('Environment warnings:\n' + environmentWarnings.map((warning) => `- ${warning}`).join('\n'));
}

export const env = {
	...parsedData,
	NEXT_PUBLIC_APP_URL: normalizedAppUrl ?? LOCAL_APP_URL,
};

export const APP_URL = env.NEXT_PUBLIC_APP_URL;
