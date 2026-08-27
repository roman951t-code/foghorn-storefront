import type { ActionHandler, RecordActionResponse } from 'adminjs';
import { Prisma } from '@prisma/client';
import { prisma } from '../prisma.mts';
import { recalculateProductSortPrices } from '../lib/product-sort-price.mts';

const normalizePayloadValue = (value: unknown) => (Array.isArray(value) ? value[0] : value);

const parseDateValue = (value: string): Date | null => {
	const trimmed = value.trim();
	if (!trimmed) return null;
	const direct = new Date(trimmed);
	if (!Number.isNaN(direct.getTime())) return direct;

	const localizedDateMatch = trimmed.match(
		/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})(?:,\s*|\s+)(\d{1,2}):(\d{2})(?::(\d{2}))?$/
	);
	if (!localizedDateMatch) return null;

	const day = Number(localizedDateMatch[1]);
	const month = Number(localizedDateMatch[2]);
	const year = Number(localizedDateMatch[3]);
	const hours = Number(localizedDateMatch[4]);
	const minutes = Number(localizedDateMatch[5]);
	const seconds = localizedDateMatch[6] ? Number(localizedDateMatch[6]) : 0;

	const parsed = new Date(year, month - 1, day, hours, minutes, seconds);
	if (
		parsed.getFullYear() !== year ||
		parsed.getMonth() !== month - 1 ||
		parsed.getDate() !== day ||
		parsed.getHours() !== hours ||
		parsed.getMinutes() !== minutes ||
		parsed.getSeconds() !== seconds
	) {
		return null;
	}

	return parsed;
};

const toOptionalDate = (value: unknown): Date | null => {
	if (value == null) return null;
	const normalizedValue = normalizePayloadValue(value);
	if (typeof normalizedValue !== 'string') return null;
	return parseDateValue(normalizedValue);
};

const toOptionalNumber = (value: unknown): number | null => {
	if (value == null) return null;
	const normalizedValue = normalizePayloadValue(value);
	if (typeof normalizedValue === 'number') return Number.isFinite(normalizedValue) ? normalizedValue : null;
	if (typeof normalizedValue !== 'string') return null;
	const trimmed = normalizedValue.trim();
	if (!trimmed) return null;
	const parsed = Number(trimmed);
	return Number.isFinite(parsed) ? parsed : null;
};

const toHasTypedValue = (value: unknown) => {
	const normalizedValue = normalizePayloadValue(value);
	if (normalizedValue == null) return false;
	if (typeof normalizedValue !== 'string') return true;
	return normalizedValue.trim() !== '';
};

type VariantDiscountInput = {
	id: string;
	discountAmount: number | null;
	hasTypedDiscountAmount: boolean;
};

const parseVariantDiscountInputs = (value: unknown): VariantDiscountInput[] | null => {
	const normalizedValue = normalizePayloadValue(value);
	let rawEntries: unknown = normalizedValue;
	if (typeof rawEntries === 'string') {
		const trimmed = rawEntries.trim();
		if (!trimmed) return [];
		try {
			rawEntries = JSON.parse(trimmed);
		} catch {
			return null;
		}
	}

	if (!Array.isArray(rawEntries)) return null;

	const parsedEntries: VariantDiscountInput[] = [];
	for (const entry of rawEntries) {
		if (!entry || typeof entry !== 'object') return null;
		const rawId = (entry as { id?: unknown }).id;
		const id = typeof rawId === 'string' ? rawId.trim() : '';
		if (!id) return null;

		const rawAmount = (entry as { discountAmount?: unknown }).discountAmount;
		const discountAmount = toOptionalNumber(rawAmount);
		const hasTypedDiscountAmount = toHasTypedValue(rawAmount);

		parsedEntries.push({ id, discountAmount, hasTypedDiscountAmount });
	}

	return parsedEntries;
};

type VariantSchedulePayload = {
	id: string;
	sku: string;
	stock: number;
	basePrice: number;
	discountPrice: number | null;
	discountStartAt: string | null;
	discountEndAt: string | null;
	label: string | null;
	attributes: Array<{
		name: string;
		value: string;
		unit: string | null;
	}>;
};

const buildVariantLabel = (
	attributes:
		| {
				attribute: { name: string; unit: string | null };
				value: string;
		  }[]
		| undefined
) => {
	if (!attributes?.length) return null;
	const label = attributes
		.map((a) => {
			const name = a.attribute.name?.trim?.() ?? '';
			const valueWithUnit = [a.value, a.attribute.unit].filter(Boolean).join(' ').trim();
			if (name && valueWithUnit) return `${name}: ${valueWithUnit}`;
			return name || valueWithUnit;
		})
		.join(' / ')
		.trim();
	return label || null;
};

const getActionPayload = async (productId: string) => {
	const [product, variants] = await Promise.all([
		prisma.product.findUnique({
			where: { id: productId },
			select: { id: true, basePrice: true, currency: true },
		}),
		prisma.productVariant.findMany({
			where: { productId },
			select: {
				id: true,
				sku: true,
				stock: true,
				price: true,
				discountPrice: true,
				discountStartAt: true,
				discountEndAt: true,
				attributes: {
					select: {
						attribute: { select: { name: true, unit: true } },
						value: true,
					},
					orderBy: { attribute: { name: 'asc' } },
				},
			},
			orderBy: [{ stock: 'desc' }, { price: 'asc' }, { createdAt: 'asc' }],
		}),
	]);

	const variantsPayload: VariantSchedulePayload[] = variants.map((variant) => ({
		id: variant.id,
		sku: variant.sku,
		stock: variant.stock,
		basePrice: variant.price.toNumber(),
		discountPrice: variant.discountPrice?.toNumber() ?? null,
		discountStartAt: variant.discountStartAt ? variant.discountStartAt.toISOString() : null,
		discountEndAt: variant.discountEndAt ? variant.discountEndAt.toISOString() : null,
		label: buildVariantLabel(variant.attributes),
		attributes: variant.attributes.map((attribute) => ({
			name: attribute.attribute.name,
			value: attribute.value,
			unit: attribute.attribute.unit,
		})),
	}));

	const sharedStartAt =
		variantsPayload.length > 0 &&
		variantsPayload.every((variant) => variant.discountStartAt === variantsPayload[0].discountStartAt)
			? variantsPayload[0].discountStartAt
			: null;
	const sharedEndAt =
		variantsPayload.length > 0 &&
		variantsPayload.every((variant) => variant.discountEndAt === variantsPayload[0].discountEndAt)
			? variantsPayload[0].discountEndAt
			: null;

	return {
		product: product
			? {
					id: product.id,
					basePrice: product.basePrice.toNumber(),
					currency: product.currency,
				}
			: null,
		variants: variantsPayload,
		discountStartAt: sharedStartAt,
		discountEndAt: sharedEndAt,
	};
};

export const scheduleDiscount: ActionHandler<RecordActionResponse> = async (req, _res, context) => {
	const { record, resource, currentAdmin } = context;
	if (!record || !resource) {
		throw new Error('Missing record context');
	}

	const method = String((req as { method?: unknown }).method ?? 'get').toLowerCase();
	const productId = record.param('id') as string;

	if (method === 'get') {
		const payload = await getActionPayload(productId);
		return { record: record.toJSON(currentAdmin), payload };
	}

	const payload = (req as { payload?: Record<string, unknown> }).payload ?? {};

	const discountStartAt = toOptionalDate(payload.discountStartAt);
	const discountEndAt = toOptionalDate(payload.discountEndAt);
	const hasStartInput = toHasTypedValue(payload.discountStartAt);
	const hasEndInput = toHasTypedValue(payload.discountEndAt);
	const hasWindowInput = hasStartInput || hasEndInput;
	const hasInvalidWindowInput =
		(hasStartInput && !discountStartAt) || (hasEndInput && !discountEndAt);

	const variantDiscountInputs = parseVariantDiscountInputs(payload.variantDiscounts);
	if (variantDiscountInputs == null) {
		const actionPayload = await getActionPayload(productId);
		return {
			record: record.toJSON(currentAdmin),
			payload: actionPayload,
			notice: { message: 'discount-price-invalid', type: 'error' },
		};
	}

	const product = await prisma.product.findUnique({
		where: { id: productId },
		select: { id: true },
	});

	if (!product) {
		return {
			record: record.toJSON(currentAdmin),
			notice: { message: 'product-not-found', type: 'error' },
		};
	}

	const variants = await prisma.productVariant.findMany({
		where: { productId },
		select: {
			id: true,
			price: true,
		},
	});

	if (!variants.length) {
		const actionPayload = await getActionPayload(productId);
		return {
			record: record.toJSON(currentAdmin),
			payload: actionPayload,
			notice: { message: 'product-variant-no-variants', type: 'error' },
		};
	}

	if (hasInvalidWindowInput) {
		const actionPayload = await getActionPayload(productId);
		return {
			record: record.toJSON(currentAdmin),
			payload: actionPayload,
			notice: { message: 'discount-window-invalid', type: 'error' },
		};
	}

	const hasWindow = Boolean(discountStartAt || discountEndAt);
	if (hasWindowInput && (!discountStartAt || !discountEndAt)) {
		const actionPayload = await getActionPayload(productId);
		return {
			record: record.toJSON(currentAdmin),
			payload: actionPayload,
			notice: { message: 'discount-window-invalid', type: 'error' },
		};
	}

	if (discountStartAt && discountEndAt && discountStartAt.getTime() >= discountEndAt.getTime()) {
		const actionPayload = await getActionPayload(productId);
		return {
			record: record.toJSON(currentAdmin),
			payload: actionPayload,
			notice: { message: 'discount-window-invalid', type: 'error' },
		};
	}

	const variantById = new Map(variants.map((variant) => [variant.id, variant]));
	const seenIds = new Set<string>();
	let hasAnyDiscountAmount = false;
	let hasInvalidDiscountValue = false;
	const discountAmountByVariantId = new Map<string, number | null>();

	for (const entry of variantDiscountInputs) {
		if (seenIds.has(entry.id)) {
			hasInvalidDiscountValue = true;
			break;
		}
		seenIds.add(entry.id);
		const variant = variantById.get(entry.id);
		if (!variant) {
			hasInvalidDiscountValue = true;
			break;
		}

		const amount = entry.discountAmount;
		if (entry.hasTypedDiscountAmount && amount == null) {
			hasInvalidDiscountValue = true;
			break;
		}

		if (amount != null) {
			const basePrice = variant.price.toNumber();
			if (!Number.isFinite(amount) || !(amount > 0) || !(amount < basePrice)) {
				hasInvalidDiscountValue = true;
				break;
			}
			hasAnyDiscountAmount = true;
			discountAmountByVariantId.set(entry.id, amount);
			continue;
		}

		discountAmountByVariantId.set(entry.id, null);
	}

	if (hasInvalidDiscountValue) {
		const actionPayload = await getActionPayload(productId);
		return {
			record: record.toJSON(currentAdmin),
			payload: actionPayload,
			notice: { message: 'discount-price-invalid', type: 'error' },
		};
	}

	if (hasWindow && !hasAnyDiscountAmount) {
		const actionPayload = await getActionPayload(productId);
		return {
			record: record.toJSON(currentAdmin),
			payload: actionPayload,
			notice: { message: 'discount-price-required', type: 'error' },
		};
	}

	try {
		await prisma.$transaction(async (tx) => {
			for (const variant of variants) {
				const discountAmount = discountAmountByVariantId.get(variant.id) ?? null;
				const variantBasePrice = variant.price.toNumber();
				const persistedDiscountPrice =
					discountAmount == null
						? null
						: Number((variantBasePrice - discountAmount).toFixed(2));

				await tx.productVariant.update({
					where: { id: variant.id },
					data: {
						discountPrice:
							persistedDiscountPrice == null ? null : new Prisma.Decimal(persistedDiscountPrice),
						discountStartAt: persistedDiscountPrice == null ? null : discountStartAt,
						discountEndAt: persistedDiscountPrice == null ? null : discountEndAt,
					},
				});
			}

			// Keep legacy product-level discount fields empty to avoid mixing old and variant schedules.
			await tx.product.update({
				where: { id: productId },
				data: {
					discountPrice: null,
					discountStartAt: null,
					discountEndAt: null,
				},
			});
		});
	} catch {
		const actionPayload = await getActionPayload(productId);
		return {
			record: record.toJSON(currentAdmin),
			payload: actionPayload,
			notice: { message: 'discount-schedule-failed', type: 'error' },
		};
	}

	recalculateProductSortPrices(prisma, [productId]).catch((error) =>
		console.error('[admin-cache] Failed to recalculate product sort prices', error),
	);

	const updated = await resource.findOne(productId);
	const actionPayload = await getActionPayload(productId);
	return {
		record: updated ? updated.toJSON(currentAdmin) : record.toJSON(currentAdmin),
		payload: actionPayload,
		notice: { message: 'discount-scheduled', type: 'success' },
	};
};
