import type { ActionRequest, ActionContext } from 'adminjs';
import { ValidationError } from 'adminjs';
import { z } from 'zod';

const emptyToNull = (value: unknown) => {
	if (value == null) return null;
	if (typeof value !== 'string') return value;
	const trimmed = value.trim();
	return trimmed === '' ? null : trimmed;
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

const ProductSchema = z
	.object({
		name: z
			.string()
			.trim()
			.min(2, 'product-validation-name-min')
			.max(200, 'product-validation-name-max'),
		slug: z
			.string()
			.trim()
			.min(3, 'product-validation-slug-min')
			.max(120, 'product-validation-slug-max')
			.regex(
				/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
				'product-validation-slug-pattern'
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
		imageUrl: z.preprocess(
			emptyToNull,
			z
				.string()
				.max(2048, 'product-validation-imageUrl-max')
				.nullable()
		),
		brandId: z.string().uuid('product-validation-brandId'),
		categoryId: z.string().uuid('product-validation-categoryId'),
		discountStartAt: toNullableDate.optional(),
		discountEndAt: toNullableDate.optional(),
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
	const payload = (request as { payload?: Record<string, unknown> }).payload ?? {};
	const baseParams = (context.record as any)?.params ?? {};
	const merged = { ...baseParams, ...payload };

	const parsed = ProductSchema.safeParse(merged);
	if (!parsed.success) {
		throw new ValidationError(zodToPropertyErrors(parsed.error), {
			message: 'product-validation-error',
			type: 'validationError',
		} as any);
	}

	return request;
};
