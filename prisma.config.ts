import { config } from 'dotenv';
import { defineConfig, env } from '@prisma/config';

// Next.js loads .env.local automatically, but the standalone Prisma CLI does
// not. Load the same local file first so the README setup works on a fresh
// clone, then fall back to .env for existing installations and CI.
config({ path: ['.env.local', '.env'], quiet: true });

export default defineConfig({
	schema: './prisma/schema.prisma',
	migrations: {
		seed: 'tsx prisma/seed.ts',
	},
	datasource: {
		url: env('DATABASE_URL'),
	},
});
