import { z } from 'zod';

const LOCAL_APP_URL = 'http://localhost:3000';

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

const publicEnvSchema = z.object({
	NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

const parsed = publicEnvSchema.safeParse(process.env);

if (!parsed.success) {
	console.error('Invalid public environment variables', parsed.error.flatten().fieldErrors);
	throw new Error('Invalid public environment variables');
}

const normalizedAppUrl = normalizeAppUrl(parsed.data.NEXT_PUBLIC_APP_URL);

if (process.env.NODE_ENV === 'production' && !normalizedAppUrl) {
	console.error('Invalid public environment variables', {
		NEXT_PUBLIC_APP_URL: ['NEXT_PUBLIC_APP_URL is required in production'],
	});
	throw new Error('Invalid public environment variables');
}

const publicEnv = {
	NEXT_PUBLIC_APP_URL: normalizedAppUrl ?? LOCAL_APP_URL,
};

export const PUBLIC_APP_URL = publicEnv.NEXT_PUBLIC_APP_URL;
export { publicEnv };
