import 'dotenv/config';
import { defineConfig, env } from '@prisma/config';

export default defineConfig({
	schema: './schema.prisma',
	engine: 'classic',
	datasource: {
		url: env('DATABASE_URL'),
	},
});
