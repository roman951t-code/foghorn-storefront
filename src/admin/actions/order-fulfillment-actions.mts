import type { ActionHandler, RecordActionResponse } from 'adminjs';
import { prisma } from '../prisma.mts';

const resolveAdminEmail = (currentAdmin: unknown): string | null => {
	if (!currentAdmin || typeof currentAdmin !== 'object') return null;
	const email = (currentAdmin as { email?: unknown }).email;
	return typeof email === 'string' && email.trim() !== '' ? email : null;
};

export const setFulfillment: ActionHandler<RecordActionResponse> = async (req, _res, context) => {
	const { record, currentAdmin } = context;
	if (!record) {
		throw new Error('Missing record context');
	}

	const orderId = record.param('id') as string;
	const method = ((req as { method?: string }).method ?? 'get').toLowerCase();
	const payload = (req as { payload?: Record<string, unknown> }).payload ?? {};

	if (method === 'post') {
		const carrierRaw = typeof payload.carrier === 'string' ? payload.carrier.trim() : '';
		const trackingNumberRaw =
			typeof payload.trackingNumber === 'string' ? payload.trackingNumber.trim() : '';

		const carrier = carrierRaw === '' ? null : carrierRaw;
		const trackingNumber = trackingNumberRaw === '' ? null : trackingNumberRaw;

		const adminEmail = resolveAdminEmail(currentAdmin);

		await prisma.$transaction(async (tx) => {
			await tx.order.update({
				where: { id: orderId },
				data: { carrier, trackingNumber },
			});
			await tx.orderAuditEntry.create({
				data: {
					orderId,
					type: 'NOTE',
					note: `Fulfillment updated: carrier=${carrier ?? '-'}, tracking=${trackingNumber ?? '-'}`,
					adminEmail,
				},
			});
		});

		const updated = await prisma.order.findUnique({
			where: { id: orderId },
			select: { carrier: true, trackingNumber: true },
		});

		return {
			record: record.toJSON(currentAdmin),
			payload: {
				carrier: updated?.carrier ?? null,
				trackingNumber: updated?.trackingNumber ?? null,
			},
			notice: { message: 'fulfillment-updated', type: 'success' },
		};
	}

	const current = await prisma.order.findUnique({
		where: { id: orderId },
		select: { carrier: true, trackingNumber: true },
	});

	return {
		record: record.toJSON(currentAdmin),
		payload: {
			carrier: current?.carrier ?? null,
			trackingNumber: current?.trackingNumber ?? null,
		},
	};
};
