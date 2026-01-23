import type { ActionHandler, RecordActionResponse } from 'adminjs';
import { Prisma } from '@prisma/client';
import { prisma } from '../prisma.mts';

const toOptionalDate = (value: unknown): Date | null => {
	if (value == null) return null;
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	if (!trimmed) return null;
	const parsed = new Date(trimmed);
	return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toOptionalNumber = (value: unknown): number | null => {
	if (value == null) return null;
	if (typeof value === 'number') return Number.isFinite(value) ? value : null;
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	if (!trimmed) return null;
	const parsed = Number(trimmed);
	return Number.isFinite(parsed) ? parsed : null;
};

export const scheduleDiscount: ActionHandler<RecordActionResponse> = async (req, _res, context) => {
	const { record, resource, currentAdmin } = context;
	if (!record || !resource) {
		throw new Error('Missing record context');
	}

	const method = String((req as { method?: unknown }).method ?? 'get').toLowerCase();
	const productId = record.param('id') as string;

	if (method === 'get') {
		return { record: record.toJSON(currentAdmin) };
	}

	const payload = (req as { payload?: Record<string, unknown> }).payload ?? {};

	const discountPriceValue = toOptionalNumber(payload.discountPrice);
	const discountStartAt = toOptionalDate(payload.discountStartAt);
	const discountEndAt = toOptionalDate(payload.discountEndAt);

	const product = await prisma.product.findUnique({
		where: { id: productId },
		select: { basePrice: true },
	});

	if (!product) {
		return {
			record: record.toJSON(currentAdmin),
			notice: { message: 'product-not-found', type: 'error' },
		};
	}

	const basePrice = product.basePrice.toNumber();

	const hasWindow = Boolean(discountStartAt || discountEndAt);
	if (hasWindow && (!discountStartAt || !discountEndAt)) {
		return {
			record: record.toJSON(currentAdmin),
			notice: { message: 'discount-window-invalid', type: 'error' },
		};
	}

	if (discountStartAt && discountEndAt && discountStartAt.getTime() >= discountEndAt.getTime()) {
		return {
			record: record.toJSON(currentAdmin),
			notice: { message: 'discount-window-invalid', type: 'error' },
		};
	}

	if (hasWindow && discountPriceValue == null) {
		return {
			record: record.toJSON(currentAdmin),
			notice: { message: 'discount-price-required', type: 'error' },
		};
	}

	if (discountPriceValue != null) {
		if (!(discountPriceValue > 0) || !(discountPriceValue < basePrice)) {
			return {
				record: record.toJSON(currentAdmin),
				notice: { message: 'discount-price-invalid', type: 'error' },
			};
		}
	}

	await prisma.product.update({
		where: { id: productId },
		data: {
			discountPrice: discountPriceValue == null ? null : new Prisma.Decimal(discountPriceValue),
			discountStartAt,
			discountEndAt,
		},
	});

	const updated = await resource.findOne(productId);
	return {
		record: updated ? updated.toJSON(currentAdmin) : record.toJSON(currentAdmin),
		notice: { message: 'discount-scheduled', type: 'success' },
	};
};

