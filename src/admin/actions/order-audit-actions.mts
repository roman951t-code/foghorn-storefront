import type { ActionHandler, RecordActionResponse } from 'adminjs';
import type { OrderStatus } from '@prisma/client';
import { prisma } from '../prisma.mts';

type AuditEntryPayload = {
	id: string;
	type: 'STATUS_CHANGE' | 'NOTE';
	fromStatus: OrderStatus | null;
	toStatus: OrderStatus | null;
	note: string | null;
	adminEmail: string | null;
	createdAt: string;
};

const resolveAdminEmail = (currentAdmin: unknown): string | null => {
	if (!currentAdmin || typeof currentAdmin !== 'object') {
		return null;
	}
	const email = (currentAdmin as { email?: unknown }).email;
	if (typeof email !== 'string' || email.trim() === '') {
		return null;
	}
	return email;
};

const buildAuditPayload = async (orderId: string): Promise<AuditEntryPayload[]> => {
	const entries = await prisma.orderAuditEntry.findMany({
		where: { orderId },
		orderBy: { createdAt: 'desc' },
	});
	return entries.map((entry) => ({
		id: entry.id,
		type: entry.type,
		fromStatus: entry.fromStatus,
		toStatus: entry.toStatus,
		note: entry.note,
		adminEmail: entry.adminEmail,
		createdAt: entry.createdAt.toISOString(),
	}));
};

export const auditTimeline: ActionHandler<RecordActionResponse> = async (req, _res, context) => {
	const { record, currentAdmin } = context;
	if (!record) {
		throw new Error('Missing record context');
	}
	const orderId = record.param('id') as string;
	const payload = (req as { payload?: Record<string, unknown> }).payload ?? {};
	const method = (req as { method?: string }).method ?? 'get';
	const adminEmail = resolveAdminEmail(currentAdmin);

	if (method.toLowerCase() === 'post') {
		const note = typeof payload.note === 'string' ? payload.note.trim() : '';
		if (!note) {
			return {
				record: record.toJSON(currentAdmin),
				payload: { entries: await buildAuditPayload(orderId) },
				notice: { message: 'audit-note-empty', type: 'error' },
			};
		}
		await prisma.orderAuditEntry.create({
			data: {
				orderId,
				type: 'NOTE',
				note,
				adminEmail,
			},
		});
		return {
			record: record.toJSON(currentAdmin),
			payload: { entries: await buildAuditPayload(orderId) },
			notice: { message: 'audit-note-added', type: 'success' },
		};
	}

	return {
		record: record.toJSON(currentAdmin),
		payload: { entries: await buildAuditPayload(orderId) },
	};
};
