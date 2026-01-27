import type { ActionHandler, BulkActionResponse, RecordActionResponse } from 'adminjs';
import type { OrderStatus } from '@prisma/client';
import Stripe from 'stripe';
import { prisma } from '../prisma.mts';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe =
	stripeSecretKey && stripeSecretKey !== ''
		? new Stripe(stripeSecretKey, { apiVersion: '2025-12-15.clover' })
		: null;

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

const updateOrderStatusWithAudit = async (
	orderId: string,
	next: OrderStatus,
	currentStatus: OrderStatus | undefined,
	adminEmail: string | null
) => {
	if (currentStatus === next) {
		return;
	}
	await prisma.$transaction([
		prisma.order.update({
			where: { id: orderId },
			data: { status: next },
		}),
		prisma.orderAuditEntry.create({
			data: {
				orderId,
				type: 'STATUS_CHANGE',
				fromStatus: currentStatus ?? null,
				toStatus: next,
				adminEmail,
			},
		}),
	]);
};

const makeStatusAction = (
	next: OrderStatus,
	allowedCurrent?: OrderStatus[]
): ActionHandler<RecordActionResponse> => {
	return async (_req, _res, context) => {
		const { record, resource, currentAdmin } = context;
		if (!record || !resource) {
			throw new Error('Missing record context');
		}
		const currentStatus = record.param('status') as OrderStatus | undefined;
		if (allowedCurrent && currentStatus && !allowedCurrent.includes(currentStatus)) {
			return {
				record: record.toJSON(currentAdmin),
				notice: { message: 'status-not-allowed', type: 'error' },
			};
		}
		const orderId = record.param('id') as string;
		const adminEmail = resolveAdminEmail(currentAdmin);
		await updateOrderStatusWithAudit(orderId, next, currentStatus, adminEmail);
		const updated = await resource.findOne(orderId);
		return {
			record: updated ? updated.toJSON(currentAdmin) : record.toJSON(currentAdmin),
			notice: { message: 'status-updated', type: 'success', options: { status: next } },
		};
	};
};

const makeBulkStatusAction = (next: OrderStatus): ActionHandler<BulkActionResponse> => {
	return async (_req, _res, context) => {
		const { records, resource, currentAdmin } = context;
		if (!records || !resource) {
			throw new Error('Missing record context');
		}
		const ids = records.map((record) => record.param('id')).filter(Boolean) as string[];
		if (!ids.length) {
			return {
				records: records.map((record) => record.toJSON(currentAdmin)),
				notice: { message: 'bulk-no-records', type: 'error' },
			};
		}
		try {
			const adminEmail = resolveAdminEmail(currentAdmin);
			const updates: Promise<void>[] = [];
			for (const record of records) {
				const orderId = record.param('id') as string | undefined;
				if (!orderId) continue;
				const currentStatus = record.param('status') as OrderStatus | undefined;
				updates.push(updateOrderStatusWithAudit(orderId, next, currentStatus, adminEmail));
			}
			await Promise.all(updates);
			const refreshed = await Promise.all(ids.map((id) => resource.findOne(id)));
			const jsonRecords = refreshed
				.filter(Boolean)
				.map((record) => record!.toJSON(currentAdmin));
			return {
				records: jsonRecords,
				notice: {
					message: 'bulk-status-updated',
					type: 'success',
					options: { status: next, count: ids.length },
				},
			};
		} catch {
			return {
				records: records.map((record) => record.toJSON(currentAdmin)),
				notice: { message: 'bulk-status-update-failed', type: 'error' },
			};
		}
	};
};

const refundStripeSession = async (stripeSessionId: string) => {
	if (!stripe) {
		throw new Error('refund-unavailable');
	}
	const session = await stripe.checkout.sessions.retrieve(stripeSessionId, {
		expand: ['payment_intent'],
	});
	if (session.payment_status !== 'paid') {
		throw new Error('refund-unavailable');
	}
	const paymentIntent = session.payment_intent;
	const paymentIntentId =
		typeof paymentIntent === 'string' ? paymentIntent : paymentIntent?.id;
	if (!paymentIntentId) {
		throw new Error('refund-unavailable');
	}
	await stripe.refunds.create({
		payment_intent: paymentIntentId,
		reason: 'requested_by_customer',
	});
};

const refundStripeSessionAmount = async (stripeSessionId: string, amount: number) => {
	if (!stripe) {
		throw new Error('refund-unavailable');
	}
	const session = await stripe.checkout.sessions.retrieve(stripeSessionId, {
		expand: ['payment_intent'],
	});
	if (session.payment_status !== 'paid') {
		throw new Error('refund-unavailable');
	}
	const paymentIntent = session.payment_intent;
	const paymentIntentId =
		typeof paymentIntent === 'string' ? paymentIntent : paymentIntent?.id;
	if (!paymentIntentId) {
		throw new Error('refund-unavailable');
	}
	const amountCents = Math.max(0, Math.round(amount * 100));
	if (!amountCents) {
		throw new Error('refund-unavailable');
	}
	await stripe.refunds.create({
		payment_intent: paymentIntentId,
		amount: amountCents,
		reason: 'requested_by_customer',
	});
};

const parseRefundAmount = (value: unknown): number | null => {
	if (value == null) return null;
	if (typeof value === 'number') return Number.isFinite(value) ? value : null;
	if (typeof value === 'string') {
		const trimmed = value.trim();
		if (!trimmed) return null;
		const parsed = Number(trimmed);
		return Number.isFinite(parsed) ? parsed : null;
	}
	return null;
};

export const setStatus: ActionHandler<RecordActionResponse> = async (req, _res, context) => {
	const { record, resource, currentAdmin } = context;
	const payload = (req as { payload?: Record<string, unknown> }).payload ?? {};
	const requested = payload.status as OrderStatus | undefined;
	const method = (req as { method?: string }).method ?? 'get';
	if (!record || !resource) {
		throw new Error('Missing record context');
	}
	if (method.toLowerCase() === 'get' || !requested) {
		return {
			record: record.toJSON(currentAdmin),
		};
	}
	const validStatuses: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];
	if (!validStatuses.includes(requested)) {
		return {
			record: record.toJSON(currentAdmin),
			notice: { message: 'invalid-status', type: 'error' },
		};
	}
	return makeStatusAction(requested)(req, _res, context);
};

export const markPaid = makeStatusAction('PAID', ['PENDING']);
export const markShipped = makeStatusAction('SHIPPED', ['PAID']);
export const markDelivered = makeStatusAction('DELIVERED', ['SHIPPED']);

export const bulkMarkShipped = makeBulkStatusAction('SHIPPED');
export const bulkMarkDelivered = makeBulkStatusAction('DELIVERED');

export const cancelOrder: ActionHandler<RecordActionResponse> = async (req, _res, context) => {
	const { record, resource, currentAdmin } = context;
	const payload = (req as { payload?: Record<string, unknown> }).payload ?? {};
	const refundRequested = String(payload.refund ?? 'false') === 'true';

	if (!record || !resource) {
		throw new Error('Missing record context');
	}

	const orderId = record.param('id') as string;
	const stripeSessionId = record.param('stripeSessionId') as string | null;
	const currentStatus = record.param('status') as OrderStatus | undefined;

	if (currentStatus === 'CANCELLED' || currentStatus === 'DELIVERED' || currentStatus === 'RETURNED') {
		return {
			record: record.toJSON(currentAdmin),
			notice: { message: 'order-not-cancellable', type: 'error' },
		};
	}

	if (refundRequested) {
		if (!stripeSessionId) {
			return {
				record: record.toJSON(currentAdmin),
				notice: { message: 'refund-unavailable', type: 'error' },
			};
		}
		try {
			await refundStripeSession(stripeSessionId);
		} catch (error) {
			const message =
				error instanceof Error && error.message === 'refund-unavailable'
					? 'refund-unavailable'
					: 'refund-failed';
			return {
				record: record.toJSON(currentAdmin),
				notice: { message, type: 'error' },
			};
		}
	}

	const adminEmail = resolveAdminEmail(currentAdmin);
	await updateOrderStatusWithAudit(orderId, 'CANCELLED', currentStatus, adminEmail);
	const updated = await resource.findOne(orderId);
	return {
		record: updated ? updated.toJSON(currentAdmin) : record.toJSON(currentAdmin),
		notice: {
			message: refundRequested ? 'order-cancelled-refunded' : 'order-cancelled',
			type: 'success',
		},
	};
};

export const deleteOrder: ActionHandler<RecordActionResponse> = async (_req, _res, context) => {
	const { record, currentAdmin } = context;
	if (!record) {
		throw new Error('Missing record context');
	}
	const orderId = record.param('id') as string;
	await prisma.orderItem.deleteMany({ where: { orderId } });
	await prisma.order.delete({ where: { id: orderId } });
	return {
		record: record.toJSON(currentAdmin),
		notice: { message: 'order-deleted', type: 'success' },
	};
};

export const processReturn: ActionHandler<RecordActionResponse> = async (req, _res, context) => {
	const { record, resource, currentAdmin } = context;
	const method = ((req as { method?: string }).method ?? 'get').toLowerCase();
	const payload = (req as { payload?: Record<string, unknown> }).payload ?? {};

	if (!record || !resource) {
		throw new Error('Missing record context');
	}

	if (method === 'get') {
		return {
			record: record.toJSON(currentAdmin),
		};
	}

	const orderId = record.param('id') as string;
	const refundAmountRaw = parseRefundAmount(payload.refundAmount);
	const refundReason =
		typeof payload.refundReason === 'string' && payload.refundReason.trim()
			? payload.refundReason.trim()
			: null;

	const order = await prisma.order.findUnique({
		where: { id: orderId },
		select: { total: true, stripeSessionId: true, status: true },
	});

	if (!order) {
		return {
			record: record.toJSON(currentAdmin),
			notice: { message: 'order-not-found', type: 'error' },
		};
	}

	if (order.status === 'CANCELLED') {
		return {
			record: record.toJSON(currentAdmin),
			notice: { message: 'order-not-returnable', type: 'error' },
		};
	}

	const total = Number(order.total ?? 0);
	const refundAmount = refundAmountRaw ?? 0;
	if (refundAmount < 0 || refundAmount > total) {
		return {
			record: record.toJSON(currentAdmin),
			notice: { message: 'return-refund-invalid', type: 'error' },
		};
	}

	if (refundAmount > 0) {
		if (!order.stripeSessionId) {
			return {
				record: record.toJSON(currentAdmin),
				notice: { message: 'refund-unavailable', type: 'error' },
			};
		}
		try {
			await refundStripeSessionAmount(order.stripeSessionId, refundAmount);
		} catch (error) {
			const message =
				error instanceof Error && error.message === 'refund-unavailable'
					? 'refund-unavailable'
					: 'refund-failed';
			return {
				record: record.toJSON(currentAdmin),
				notice: { message, type: 'error' },
			};
		}
	}

	const adminEmail = resolveAdminEmail(currentAdmin);
	const nextStatus: OrderStatus = 'RETURNED';
	const nextRefundAmount = refundAmountRaw ?? null;
	const now = new Date();

	const statusChanged = order.status !== nextStatus;
	await prisma.$transaction(async (tx) => {
		await tx.order.update({
			where: { id: orderId },
			data: {
				status: nextStatus,
				refundAmount: nextRefundAmount,
				refundReason,
				refundedAt: now,
			},
		});
		if (statusChanged) {
			await tx.orderAuditEntry.create({
				data: {
					orderId,
					type: 'STATUS_CHANGE',
					fromStatus: order.status as OrderStatus,
					toStatus: nextStatus,
					adminEmail,
				},
			});
		}
		if (refundReason || refundAmount > 0) {
			await tx.orderAuditEntry.create({
				data: {
					orderId,
					type: 'NOTE',
					note: `Return processed: refund=${refundAmount.toFixed(2)}; reason=${refundReason ?? '-'}`,
					adminEmail,
				},
			});
		}
	});

	const updated = await resource.findOne(orderId);
	return {
		record: updated ? updated.toJSON(currentAdmin) : record.toJSON(currentAdmin),
		notice: { message: 'return-processed', type: 'success' },
	};
};
