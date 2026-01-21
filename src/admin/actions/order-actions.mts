import type { ActionHandler, BulkActionResponse, RecordActionResponse } from 'adminjs';
import type { OrderStatus } from '@prisma/client';
import Stripe from 'stripe';
import { prisma } from '../prisma.mts';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe =
	stripeSecretKey && stripeSecretKey !== ''
		? new Stripe(stripeSecretKey, { apiVersion: '2025-12-15.clover' })
		: null;

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
		await prisma.order.update({
			where: { id: orderId },
			data: { status: next },
		});
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
			await prisma.order.updateMany({
				where: { id: { in: ids } },
				data: { status: next },
			});
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
	const validStatuses: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
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

	if (currentStatus === 'CANCELLED' || currentStatus === 'DELIVERED') {
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

	await prisma.order.update({
		where: { id: orderId },
		data: { status: 'CANCELLED' },
	});
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
