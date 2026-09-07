import type { ActionHandler, RecordActionResponse } from 'adminjs';
import { prisma } from '../prisma.mts';

const toOptionalDate = (value: unknown): Date | null => {
	if (value == null) return null;
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	if (!trimmed) return null;
	const parsed = new Date(trimmed);
	return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const schedulePublish: ActionHandler<RecordActionResponse> = async (req, _res, context) => {
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
	const publishStartAt = toOptionalDate(payload.publishStartAt);
	const publishEndAt = toOptionalDate(payload.publishEndAt);

	if (publishStartAt && publishEndAt && publishStartAt.getTime() >= publishEndAt.getTime()) {
		return {
			record: record.toJSON(currentAdmin),
			notice: { message: 'publish-window-invalid', type: 'error' },
		};
	}

	await prisma.product.update({
		where: { id: productId },
		data: {
			publishStartAt,
			publishEndAt,
		},
	});

	const updated = await resource.findOne(productId);
	return {
		record: updated ? updated.toJSON(currentAdmin) : record.toJSON(currentAdmin),
		notice: { message: 'publish-schedule-saved', type: 'success' },
	};
};
