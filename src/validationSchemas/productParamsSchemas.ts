import { z } from 'zod';
import { localeSchema, slugSchema } from '@/utils/validateParams';

export const categoryParamsSchema = z.object({
	category: slugSchema,
	locale: localeSchema,
});

export const subcategoryParamsSchema = z.object({
	category: slugSchema,
	subcategory: slugSchema,
	locale: localeSchema,
});

export const productParamsSchema = z.object({
	category: slugSchema,
	subcategory: slugSchema,
	product: slugSchema,
	locale: localeSchema,
});

export const productSearchParamsSchema = z.object({
	tab: z.string().optional(),
	image: z.string().optional(),
});
