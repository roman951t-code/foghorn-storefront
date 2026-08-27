import { notFound } from 'next/navigation';
import { z } from 'zod';
import { routing } from '@/i18n/routing';

export const slugSchema = z
	.string()
	.trim()
	.min(1)
	.max(150)
	.regex(/^[a-z0-9-]+$/i, { message: 'invalid_slug' });

export const localeSchema = z.enum(routing.locales);

export function ensureParams<T extends z.ZodTypeAny>(schema: T, value: unknown): z.infer<T> {
	const parsed = schema.safeParse(value);
	if (!parsed.success) {
		notFound();
	}
	return parsed.data;
}
