import { z } from 'zod';

const publicEnvSchema = z.object({
	NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

const parsed = publicEnvSchema.safeParse(process.env);

const publicEnv = parsed.success ? parsed.data : { NEXT_PUBLIC_APP_URL: undefined };

export const PUBLIC_APP_URL = publicEnv.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
export { publicEnv };
