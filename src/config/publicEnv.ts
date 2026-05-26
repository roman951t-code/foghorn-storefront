import { z } from 'zod';
import { DEFAULT_LOCAL_APP_URL, resolveAppUrlFromEnv } from './appUrl';

const publicEnvSchema = z.object({
	NEXT_PUBLIC_APP_URL: z.string().url().optional(),
	NEXT_PUBLIC_VERCEL_ENV: z.string().optional(),
	NEXT_PUBLIC_VERCEL_URL: z.string().optional(),
	NEXT_PUBLIC_VERCEL_BRANCH_URL: z.string().optional(),
	NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
});

const isLocalDatabaseUrl = (databaseUrl: string | undefined) => {
	if (!databaseUrl) return false;
	try {
		const url = new URL(databaseUrl);
		return ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname.toLowerCase());
	} catch {
		return false;
	}
};

const parsed = publicEnvSchema.safeParse(process.env);

if (!parsed.success) {
	console.error('Invalid public environment variables', parsed.error.flatten().fieldErrors);
	throw new Error('Invalid public environment variables');
}

const isBrowser = typeof window !== 'undefined';
const normalizedAppUrl = isBrowser
	? window.location.origin
	: resolveAppUrlFromEnv({
			env: process.env as Record<string, string | undefined>,
			publicOnly: true,
		});

if (
	!isBrowser &&
	process.env.NODE_ENV === 'production' &&
	normalizedAppUrl === DEFAULT_LOCAL_APP_URL &&
	!isLocalDatabaseUrl(process.env.DATABASE_URL)
) {
	console.error('Invalid public environment variables', {
		NEXT_PUBLIC_APP_URL: ['NEXT_PUBLIC_APP_URL is required in production'],
	});
	throw new Error('Invalid public environment variables');
}

const publicEnv = {
	NEXT_PUBLIC_APP_URL: normalizedAppUrl,
};

export const PUBLIC_APP_URL = publicEnv.NEXT_PUBLIC_APP_URL;
