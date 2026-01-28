import type { ActionHandler, RecordActionResponse } from 'adminjs';
import { prisma } from '../prisma.mts';

export type InventoryAdjustmentSource = 'EDIT' | 'BULK_ADJUST' | 'CSV_IMPORT';

export type InventoryAdjustmentEntry = {
	id: string;
	source: InventoryAdjustmentSource;
	reason: string;
	previousStock: number;
	nextStock: number;
	delta: number;
	adminEmail: string | null;
	createdAt: string;
};

const resolveAdminEmail = (currentAdmin: unknown): string | null => {
	if (!currentAdmin || typeof currentAdmin !== 'object') return null;
	const email = (currentAdmin as { email?: unknown }).email;
	if (typeof email !== 'string' || email.trim() === '') return null;
	return email;
};

const normalizeReason = (reason: unknown, fallback: string) => {
	if (typeof reason !== 'string') return fallback;
	const trimmed = reason.trim();
	return trimmed.length > 0 ? trimmed : fallback;
};

export const logInventoryAdjustment = async (params: {
	productId: string;
	previousStock: number;
	nextStock: number;
	reason: string;
	source: InventoryAdjustmentSource;
	adminEmail?: string | null;
}) => {
	const { productId, previousStock, nextStock, reason, source, adminEmail } = params;
	if (previousStock === nextStock) return;
	const delta = Math.trunc(nextStock) - Math.trunc(previousStock);
	await prisma.inventoryAdjustment.create({
		data: {
			productId,
			source,
			reason,
			previousStock: Math.trunc(previousStock),
			nextStock: Math.trunc(nextStock),
			delta: Math.trunc(delta),
			adminEmail: adminEmail ?? null,
		},
	});
};

export const inventoryAdjustmentHistory: ActionHandler<RecordActionResponse> = async (_req, _res, context) => {
	const { record, currentAdmin } = context;
	if (!record) throw new Error('Missing record context');
	const productId = record.param('id') as string;

	const entries = await prisma.inventoryAdjustment.findMany({
		where: { productId },
		orderBy: { createdAt: 'desc' },
		take: 100,
	});

	const payload: { entries: InventoryAdjustmentEntry[] } = {
		entries: entries.map((entry) => ({
			id: entry.id,
			source: entry.source as InventoryAdjustmentSource,
			reason: entry.reason,
			previousStock: entry.previousStock,
			nextStock: entry.nextStock,
			delta: entry.delta,
			adminEmail: entry.adminEmail ?? null,
			createdAt: entry.createdAt.toISOString(),
		})),
	};

	return {
		record: record.toJSON(currentAdmin),
		payload,
	};
};

export const resolveInventoryAdminEmail = resolveAdminEmail;
export const resolveInventoryReason = normalizeReason;
