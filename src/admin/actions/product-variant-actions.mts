import type { ActionHandler, RecordActionResponse } from 'adminjs';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../prisma.mts';
import { recalculateProductSortPrices } from '../lib/product-sort-price.mts';

const toNumber = (value: unknown) => {
	if (typeof value === 'number') return value;
	if (typeof value !== 'string') return NaN;
	const trimmed = value.trim();
	if (!trimmed) return NaN;
	return Number(trimmed);
};


const optionSchema = z.object({
	attributeId: z.string().uuid(),
	value: z.string().trim().min(1),
});

const variantSchema = z.object({
	sku: z.string().trim().min(1),
	price: z.preprocess((value) => toNumber(value), z.number().min(0)),
	stock: z.preprocess((value) => toNumber(value), z.number().int().min(0)),
	options: z.array(optionSchema).min(1),
});

const payloadSchema = z.object({
	attributes: z
		.array(
			z.object({
				id: z.string().uuid(),
				values: z.array(z.string()),
			})
		)
		.optional(),
	variants: z.array(variantSchema).optional(),
});

type VariantOption = { attributeId: string; value: string };

const buildSignature = (options: VariantOption[]) =>
	options
		.slice()
		.sort((a, b) => a.attributeId.localeCompare(b.attributeId))
		.map((option) => `${option.attributeId}:${option.value}`)
		.join('|');

export const productVariantMatrix: ActionHandler<RecordActionResponse> = async (req, _res, context) => {
	const { record, resource, currentAdmin } = context;
	if (!record || !resource) {
		throw new Error('Missing record context');
	}

	const method = String((req as { method?: unknown }).method ?? 'get').toLowerCase();
	const productId = record.param('id') as string;

	if (method === 'get') {
		const [product, attributes, variants] = await Promise.all([
			prisma.product.findUnique({
				where: { id: productId },
				select: { name: true, basePrice: true, currency: true, productCode: true, categoryId: true },
			}),
			prisma.productAttribute.findMany({
				select: { id: true, name: true, unit: true },
				orderBy: { name: 'asc' },
			}),
			prisma.productVariant.findMany({
				where: { productId },
				select: {
					id: true,
					sku: true,
					price: true,
					stock: true,
					attributes: {
						select: { attributeId: true, value: true },
					},
				},
				orderBy: { createdAt: 'asc' },
			}),
		]);

		const categoryId = product?.categoryId ?? null;
		const attributeSet = categoryId
			? await prisma.productAttributeSet.findUnique({
					where: { categoryId },
					select: {
						id: true,
						items: {
							select: {
								attributeId: true,
								sortOrder: true,
								attribute: { select: { id: true, name: true, unit: true } },
							},
							orderBy: [{ sortOrder: 'asc' }, { attributeId: 'asc' }],
						},
					},
				})
			: null;
		const templateAttributes = attributeSet?.items.map((item) => item.attribute) ?? [];
		const availableAttributes = templateAttributes.length > 0 ? templateAttributes : attributes;
		const allowedAttributeIds = new Set(availableAttributes.map((attr) => attr.id));
		const attributeValues = await prisma.productAttributeValue.findMany({
			where: { productId, attributeId: { in: Array.from(allowedAttributeIds) } },
			select: { id: true, attributeId: true, value: true },
			orderBy: { value: 'asc' },
		});

		const productPayload = product
			? {
					name: product.name,
					basePrice: product.basePrice.toNumber(),
					currency: product.currency,
					productCode: product.productCode,
				}
			: null;

		return {
			record: record.toJSON(currentAdmin),
			payload: {
				product: productPayload,
				attributes: availableAttributes,
				attributeValues,
				variants: variants.map((variant) => ({
					id: variant.id,
					sku: variant.sku,
					price: variant.price.toNumber(),
					stock: variant.stock,
					options: variant.attributes,
				})),
			},
		};
	}

	const rawPayload = (req as { payload?: Record<string, unknown> }).payload ?? {};
	if (typeof rawPayload.attributes === 'string') {
		try {
			rawPayload.attributes = JSON.parse(rawPayload.attributes);
		} catch {
			return {
				record: record.toJSON(currentAdmin),
				notice: { message: 'product-variant-invalid', type: 'error' },
			};
		}
	}
	if (typeof rawPayload.variants === 'string') {
		try {
			rawPayload.variants = JSON.parse(rawPayload.variants);
		} catch {
			return {
				record: record.toJSON(currentAdmin),
				notice: { message: 'product-variant-invalid', type: 'error' },
			};
		}
	}
	const parsed = payloadSchema.safeParse(rawPayload);
	if (!parsed.success) {
		return {
			record: record.toJSON(currentAdmin),
			notice: { message: 'product-variant-invalid', type: 'error' },
		};
	}

	const normalizedAttributes =
		parsed.data.attributes?.map((attribute) => {
			const values = Array.from(
				new Set(
					attribute.values
						.map((value) => String(value).trim())
						.filter(Boolean)
				)
			);
			return { id: attribute.id, values };
		}) ?? [];

	const variants = parsed.data.variants ?? [];

	const categoryIdRaw = record.param('categoryId') as string | undefined;
	const categoryId =
		categoryIdRaw ??
		(
			await prisma.product.findUnique({
				where: { id: productId },
				select: { categoryId: true },
			})
		)?.categoryId;
	const template = categoryId
		? await prisma.productAttributeSet.findUnique({
				where: { categoryId },
				select: { items: { select: { attributeId: true } } },
			})
		: null;
	const allowedTemplateIds = template ? new Set(template.items.map((item) => item.attributeId)) : null;

	if (allowedTemplateIds) {
		for (const attribute of normalizedAttributes) {
			if (!allowedTemplateIds.has(attribute.id)) {
				return {
					record: record.toJSON(currentAdmin),
					notice: { message: 'product-variant-attribute-not-allowed', type: 'error' },
				};
			}
		}
		for (const variant of variants) {
			for (const option of variant.options) {
				if (!allowedTemplateIds.has(option.attributeId)) {
					return {
						record: record.toJSON(currentAdmin),
						notice: { message: 'product-variant-attribute-not-allowed', type: 'error' },
					};
				}
			}
		}
	}
	const signatureSet = new Set<string>();
	const skuSet = new Set<string>();

	for (const variant of variants) {
		if (skuSet.has(variant.sku)) {
			return {
				record: record.toJSON(currentAdmin),
				notice: { message: 'product-variant-duplicate-sku', type: 'error' },
			};
		}
		skuSet.add(variant.sku);

		const signature = buildSignature(variant.options);
		if (signatureSet.has(signature)) {
			return {
				record: record.toJSON(currentAdmin),
				notice: { message: 'product-variant-duplicate-combination', type: 'error' },
			};
		}
		signatureSet.add(signature);
	}

	try {
		await prisma.$transaction(async (tx) => {
			for (const attribute of normalizedAttributes) {
				const existing = await tx.productAttributeValue.findMany({
					where: { productId, attributeId: attribute.id },
					select: { id: true, value: true },
				});
				const existingValues = new Set(existing.map((entry) => entry.value));
				const desiredValues = new Set(attribute.values);
				const toDelete = existing.filter((entry) => !desiredValues.has(entry.value)).map((entry) => entry.id);
				const toCreate = attribute.values.filter((value) => !existingValues.has(value));

				if (toDelete.length > 0) {
					await tx.productAttributeValue.deleteMany({ where: { id: { in: toDelete } } });
				}

				if (toCreate.length > 0) {
					await tx.productAttributeValue.createMany({
						data: toCreate.map((value) => ({
							productId,
							attributeId: attribute.id,
							value,
						})),
					});
				}
			}

			const existingVariants = await tx.productVariant.findMany({
				where: { productId },
				select: {
					id: true,
					attributes: { select: { attributeId: true, value: true } },
				},
			});
			const existingBySignature = new Map(
				existingVariants.map((variant) => [buildSignature(variant.attributes), variant.id])
			);
			const keepIds = new Set<string>();

			for (const variant of variants) {
				const signature = buildSignature(variant.options);
				const existingId = existingBySignature.get(signature);
				const attributesPayload = variant.options.map((option) => ({
					attributeId: option.attributeId,
					value: option.value,
				}));
				const updateData = {
					sku: variant.sku,
					price: new Prisma.Decimal(variant.price),
					stock: variant.stock,
					attributes: {
						deleteMany: {},
						create: attributesPayload,
					},
				};

				if (existingId) {
					keepIds.add(existingId);
					await tx.productVariant.update({
						where: { id: existingId },
						data: updateData,
					});
				} else {
					const created = await tx.productVariant.create({
						data: {
							productId,
							sku: variant.sku,
							price: new Prisma.Decimal(variant.price),
							stock: variant.stock,
							attributes: {
								create: attributesPayload,
							},
						},
						select: { id: true },
					});
					keepIds.add(created.id);
				}
			}

			const toRemove = existingVariants.map((variant) => variant.id).filter((id) => !keepIds.has(id));
			if (toRemove.length > 0) {
				await tx.productVariant.deleteMany({ where: { id: { in: toRemove } } });
			}

			const variantAggregate = await tx.productVariant.aggregate({
				where: { productId },
				_sum: { stock: true },
			});
			const totalVariantStock = Math.max(0, Number(variantAggregate._sum.stock ?? 0));
			await tx.product.update({
				where: { id: productId },
				data: {
					stock: totalVariantStock,
					inStock: totalVariantStock > 0,
				},
			});
		});
	} catch {
		return {
			record: record.toJSON(currentAdmin),
			notice: { message: 'product-variant-save-failed', type: 'error' },
		};
	}

	recalculateProductSortPrices(prisma, [productId]).catch((error) =>
		console.error('[admin-cache] Failed to recalculate product sort prices', error),
	);

	const updated = await resource.findOne(productId);
	return {
		record: updated ? updated.toJSON(currentAdmin) : record.toJSON(currentAdmin),
		notice: { message: 'product-variant-saved', type: 'success' },
	};
};
