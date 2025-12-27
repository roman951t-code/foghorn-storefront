import { z } from 'zod';

const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
	DATABASE_URL: z.string().url({ message: 'DATABASE_URL must be a valid url' }),
	RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
	STRIPE_SECRET_KEY: z.string().optional().transform((val) => (val && val.length > 0 ? val : undefined)),
	STRIPE_CURRENCY: z.string().min(1).default('usd'),
	GOOGLE_CLIENT_ID: z.string().optional(),
	GOOGLE_CLIENT_SECRET: z.string().optional(),
	NEXT_PUBLIC_APP_URL: z.string().url().optional(),
	NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
	ENCRYPTION_KEY: z.string().optional(),
	UPSTASH_REDIS_REST_URL: z.string().url().optional(),
	UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
});

const parsed = envSchema.safeParse({
	...process.env,
	STRIPE_CURRENCY: process.env.STRIPE_CURRENCY ?? 'usd',
});

if (!parsed.success) {
	console.error('Invalid environment variables', parsed.error.flatten().fieldErrors);
	throw new Error('Invalid environment variables');
}

export const env = parsed.data;
export const APP_URL = env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
