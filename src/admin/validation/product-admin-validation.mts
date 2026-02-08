import type { ActionRequest, ActionContext } from 'adminjs';
import { ValidationError } from 'adminjs';
import { z } from 'zod';
import { prisma } from '../prisma.mts';

const emptyToNull = (value: unknown) => {
	if (value == null) return null;
	if (typeof value !== 'string') return value;
	const trimmed = value.trim();
	return trimmed === '' ? null : trimmed;
};

const toLowerTrim = (value: unknown) => {
	if (typeof value !== 'string') return value;
	return value.trim().toLowerCase();
};

const toUpperTrim = (value: unknown) => {
	if (typeof value !== 'string') return value;
	return value.trim().toUpperCase();
};

const parseCsvTags = (value: unknown): string[] | undefined => {
	if (value == null) return undefined;
	if (Array.isArray(value)) {
		const normalized = value
			.map((t) => String(t).trim())
			.filter(Boolean)
			.map((t) => t.toLowerCase());
		return Array.from(new Set(normalized));
	}
	if (typeof value !== 'string') return undefined;
	const normalized = value
		.split(',')
		.map((t) => t.trim())
		.filter(Boolean)
		.map((t) => t.toLowerCase());
	return Array.from(new Set(normalized));
};

const toNullableDate = z.preprocess((value) => {
	if (value == null) return null;
	if (typeof value === 'string') {
		const trimmed = value.trim();
		if (!trimmed) return null;
		return new Date(trimmed);
	}
	return value;
}, z.date().nullable());

const coerceUuidString = (value: unknown) => {
	if (typeof value !== 'string') return value;
	const trimmed = value.trim();
	return trimmed === '' ? value : trimmed;
};

const toSlugPart = (value: unknown): string => {
	if (typeof value !== 'string') return '';
	return value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-+|-+$/g, '');
};

const currencyValues = ['USD'] as const;
export const PRODUCT_GALLERY_URLS_CONTEXT_KEY = '__productGalleryUrls';
export const PRODUCT_GALLERY_PRIMARY_URL_CONTEXT_KEY = '__productGalleryPrimaryUrl';

const parseGalleryUrls = (value: unknown): string[] | undefined => {
	if (value === undefined) return undefined;

	const rawValues = Array.isArray(value)
		? value.map((item) => String(item))
		: typeof value === 'string'
			? value.split(/\r?\n/g)
			: [];

	const normalized = rawValues.map((item) => item.trim()).filter(Boolean);
	return Array.from(new Set(normalized));
};

const parseGalleryPrimaryUrl = (value: unknown): string | null | undefined => {
	if (value === undefined) return undefined;
	if (value == null) return null;
	if (typeof value !== 'string') return null;
	const normalized = value.trim();
	return normalized || null;
};

const ProductSchema = z
	.object({
		name: z
			.string()
			.trim()
			.min(2, 'product-validation-name-min')
			.max(200, 'product-validation-name-max'),
		metaTitle: z.preprocess(
			emptyToNull,
			z
				.string()
				.max(70, 'product-validation-metaTitle-max')
				.nullable()
		),
		metaDescription: z.preprocess(
			emptyToNull,
			z
				.string()
				.max(320, 'product-validation-metaDescription-max')
				.nullable()
		),
		canonicalUrl: z.preprocess(
			emptyToNull,
			z
				.string()
				.max(2048, 'product-validation-canonicalUrl-max')
				.url('product-validation-canonicalUrl-url')
				.nullable()
		),
		openGraphImage: z.preprocess(
			emptyToNull,
			z
				.string()
				.max(2048, 'product-validation-openGraphImage-max')
				.url('product-validation-openGraphImage-url')
				.nullable()
		),
		slug: z.preprocess(
			toLowerTrim,
			z
				.string()
				.min(3, 'product-validation-slug-min')
				.max(120, 'product-validation-slug-max')
				.regex(
					/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
					'product-validation-slug-pattern'
				)
		),
		fullSlug: z
			.string()
			.trim()
			.min(5, 'product-validation-fullSlug-required')
			.max(240, 'product-validation-fullSlug-max')
			.regex(
				/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*){2}$/,
				'product-validation-fullSlug-pattern'
			),
		categoryName: z
			.string()
			.trim()
			.min(2, 'product-validation-categoryName-min')
			.max(120, 'product-validation-categoryName-max'),
		subcategoryName: z
			.string()
			.trim()
			.min(2, 'product-validation-subcategoryName-min')
			.max(120, 'product-validation-subcategoryName-max'),
		productCode: z
			.string()
			.trim()
			.min(3, 'product-validation-productCode-min')
			.max(64, 'product-validation-productCode-max')
			.regex(
				/^[A-Za-z0-9_-]+$/,
				'product-validation-productCode-pattern'
			),
		basePrice: z.coerce
			.number()
			.refine((n) => Number.isFinite(n), 'product-validation-basePrice-number')
			.positive('product-validation-basePrice-positive'),
		discountPrice: z.preprocess(
			emptyToNull,
			z.coerce
				.number()
				.refine((n) => Number.isFinite(n), 'product-validation-discountPrice-number')
				.positive('product-validation-discountPrice-positive')
				.nullable()
		),
		stock: z.coerce
			.number()
			.refine((n) => Number.isFinite(n), 'product-validation-stock-number')
			.int('product-validation-stock-int')
			.min(0, 'product-validation-stock-nonnegative'),
		inStock: z.preprocess(
			(value) => {
				if (typeof value === 'boolean') return value;
				if (typeof value === 'string') return value === 'true';
				return Boolean(value);
			},
			z.boolean()
		),
		brand: z.preprocess(coerceUuidString, z.string().uuid('product-validation-brand')),
		category: z.preprocess(coerceUuidString, z.string().uuid('product-validation-category')),
		discountStartAt: toNullableDate.optional(),
		discountEndAt: toNullableDate.optional(),
		currency: z.preprocess(
			toUpperTrim,
			z
				.string()
				.min(1, 'product-validation-currency')
				.refine((value) => currencyValues.includes(value as (typeof currencyValues)[number]), 'product-validation-currency')
		),
	})
	.passthrough()
	.superRefine((value, ctx) => {
		if (value.discountPrice != null && !(value.discountPrice < value.basePrice)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['discountPrice'],
				message: 'product-validation-discount-lt-base',
			});
		}

		const start = value.discountStartAt ?? null;
		const end = value.discountEndAt ?? null;
		const hasWindow = Boolean(start || end);
		if (hasWindow && (!start || !end)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['discountStartAt'],
				message: 'product-validation-discount-window-both',
			});
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['discountEndAt'],
				message: 'product-validation-discount-window-both',
			});
		}
		if (start && end && start.getTime() >= end.getTime()) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['discountEndAt'],
				message: 'product-validation-discount-window-order',
			});
		}
		if (hasWindow && value.discountPrice == null) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['discountPrice'],
				message: 'product-validation-discount-window-needs-price',
			});
		}
	});

const zodToPropertyErrors = (error: z.ZodError) => {
	const propertyErrors: Record<string, { message: string; type: string }> = {};
	for (const issue of error.issues) {
		const key = String(issue.path?.[0] ?? 'base');
		if (!propertyErrors[key]) {
			let message = issue.message;
			if (!message.startsWith('product-validation-')) {
				if (key === 'basePrice') message = 'product-validation-basePrice-number';
				else if (key === 'stock') message = 'product-validation-stock-number';
				else if (key === 'discountPrice') message = 'product-validation-discountPrice-number';
				else message = 'product-validation-invalid';
			}
			propertyErrors[key] = { message, type: 'validation' };
		}
	}
	return propertyErrors;
};

export const validateProductNewEdit = async (request: ActionRequest, context: ActionContext) => {
	const requestWithPayload = request as { payload?: Record<string, unknown> };
	const payload = requestWithPayload.payload ?? {};
	const baseParams = (context.record as any)?.params ?? {};

	const nextTags = parseCsvTags(payload.tags);
	if (nextTags !== undefined) {
		requestWithPayload.payload = { ...payload, tags: nextTags };
	}

	const finalPayload = requestWithPayload.payload ?? payload;

	const normalizeNumericLike = (value: unknown): unknown => {
		if (value == null) return value;
		if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
		if (typeof value === 'string') {
			const trimmed = value.trim();
			if (!trimmed) return undefined;
			const parsed = Number(trimmed);
			return Number.isFinite(parsed) ? parsed : undefined;
		}
		return value;
	};

	// Defensive normalization for AdminJS payload oddities (e.g. NaN/empty string).
	if (!Object.prototype.hasOwnProperty.call(finalPayload, 'basePrice') || finalPayload.basePrice == null || finalPayload.basePrice === '') {
		if (baseParams.basePrice != null) {
			finalPayload.basePrice = baseParams.basePrice;
		}
	} else {
		finalPayload.basePrice = normalizeNumericLike(finalPayload.basePrice);
	}

	if (Object.prototype.hasOwnProperty.call(finalPayload, 'discountPrice')) {
		const normalizedDiscount = normalizeNumericLike(finalPayload.discountPrice);
		finalPayload.discountPrice = normalizedDiscount == null ? null : normalizedDiscount;
	}

	const galleryUrls = parseGalleryUrls(finalPayload.galleryUrls);
	if (galleryUrls !== undefined) {
		(context as Record<string, unknown>)[PRODUCT_GALLERY_URLS_CONTEXT_KEY] = galleryUrls;
		delete (finalPayload as Record<string, unknown>).galleryUrls;
	}

	const primaryGalleryUrl = parseGalleryPrimaryUrl(finalPayload.primaryGalleryUrl);
	if (primaryGalleryUrl !== undefined) {
		(context as Record<string, unknown>)[PRODUCT_GALLERY_PRIMARY_URL_CONTEXT_KEY] = primaryGalleryUrl;
		delete (finalPayload as Record<string, unknown>).primaryGalleryUrl;
	}

	if (typeof finalPayload.slug === 'string') {
		finalPayload.slug = finalPayload.slug.trim().toLowerCase();
	}

	const categoryName = (finalPayload.categoryName ?? baseParams.categoryName) as unknown;
	const subcategoryName = (finalPayload.subcategoryName ?? baseParams.subcategoryName) as unknown;
	const slug = (finalPayload.slug ?? baseParams.slug) as unknown;
	if (typeof slug === 'string' && typeof categoryName === 'string' && typeof subcategoryName === 'string') {
		finalPayload.fullSlug = `${toSlugPart(categoryName)}/${toSlugPart(subcategoryName)}/${toSlugPart(slug)}`;
	}

	const normalizeReference = (key: 'brand' | 'category') => {
		const hasKey = Object.prototype.hasOwnProperty.call(finalPayload, key);
		if (hasKey) return;
		const fromIdKey = key === 'brand' ? 'brandId' : 'categoryId';
		const candidate =
			(finalPayload[key] as unknown) ??
			(finalPayload[fromIdKey] as unknown) ??
			(baseParams[key] as unknown) ??
			(baseParams[fromIdKey] as unknown);
		if (typeof candidate === 'string') {
			(finalPayload as any)[key] = candidate;
		}
	};
	normalizeReference('brand');
	normalizeReference('category');

	const merged = { ...baseParams, ...finalPayload };
	const syncRecordParams = () => {
		const record = (context as { record?: { set?: (path: string, value: unknown) => void } }).record;
		if (!record?.set) return;
		for (const [key, value] of Object.entries(merged)) {
			record.set(key, value);
		}
	};

	const parsed = ProductSchema.safeParse(merged);
	if (!parsed.success) {
		syncRecordParams();
		throw new ValidationError(zodToPropertyErrors(parsed.error), {
			message: 'product-validation-error',
			type: 'validationError',
		} as any);
	}

	const propertyErrors: Record<string, { message: string; type: string }> = {};
	const recordId = typeof baseParams.id === 'string' ? baseParams.id : undefined;

	if (typeof parsed.data.slug === 'string') {
		const existing = await prisma.product.findFirst({
			where: recordId ? { slug: parsed.data.slug, NOT: { id: recordId } } : { slug: parsed.data.slug },
			select: { id: true },
		});
		if (existing) {
			propertyErrors.slug = { message: 'product-validation-slug-unique', type: 'validation' };
		}
	}

	if (Object.keys(propertyErrors).length > 0) {
		syncRecordParams();
		throw new ValidationError(propertyErrors, {
			message: 'product-validation-error',
			type: 'validationError',
		} as any);
	}

	return request;
};
