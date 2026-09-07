import type { ActionHandler, BulkActionResponse, RecordActionResponse } from 'adminjs';
import type { OrderStatus, Prisma } from '@prisma/client';
import Stripe from 'stripe';
import { prisma } from '../prisma.mts';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe =
	stripeSecretKey && stripeSecretKey !== ''
		? new Stripe(stripeSecretKey, { apiVersion: '2026-04-22.dahlia' })
		: null;

const INVENTORY_RESTOCKED_NOTE = 'Inventory restocked';
const RETURNABLE_ORDER_STATUSES: readonly OrderStatus[] = ['DELIVERED'];
// DELIVERED has no entry here (unlike the other statuses' generic
// transitions) because DELIVERED -> RETURNED must only happen through
// processReturn, which handles the Stripe refund and inventory restock.
// Letting the generic setStatus action reach RETURNED would flip the
// status without any of that, and since processReturn is only visible for
// DELIVERED orders, the order would then be permanently stuck with no
// refund and no UI path left to fix it.
const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
	PENDING: ['PAID', 'CANCELLED'],
	PAID: ['SHIPPED', 'CANCELLED'],
	SHIPPED: ['DELIVERED', 'CANCELLED'],
	DELIVERED: [],
	CANCELLED: [],
	RETURNED: [],
};

type OrderStatusUpdateResult =
	| { success: true; changed: boolean; status: OrderStatus }
	| { success: false; reason: 'not-found' | 'not-allowed'; status?: OrderStatus };

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

const canTransitionOrderStatus = (
	currentStatus: OrderStatus,
	nextStatus: OrderStatus,
	allowedCurrent?: readonly OrderStatus[],
) => {
	if (currentStatus === nextStatus) {
		return true;
	}
	if (allowedCurrent && !allowedCurrent.includes(currentStatus)) {
		return false;
	}
	return (ORDER_STATUS_TRANSITIONS[currentStatus] ?? []).includes(nextStatus);
};

const isReturnableOrderStatus = (status: OrderStatus) => RETURNABLE_ORDER_STATUSES.includes(status);

const restockOrderInventory = async (tx: Prisma.TransactionClient, orderId: string) => {
	const items = await tx.orderItem.findMany({
		where: { orderId },
		select: { productId: true, variantId: true, quantity: true },
	});

	for (const item of items) {
		if (!item.variantId) continue;
		await tx.productVariant.updateMany({
			where: { id: item.variantId, productId: item.productId },
			data: { stock: { increment: item.quantity } },
		});
	}

	const productIds = Array.from(new Set(items.map((item) => item.productId)));
	for (const productId of productIds) {
		const remaining = await tx.productVariant.findMany({
			where: { productId, stock: { gt: 0 } },
			select: { stock: true },
		});
		const totalStock = remaining.reduce((sum, v) => sum + (v.stock ?? 0), 0);
		await tx.product.update({
			where: { id: productId },
			data: { stock: totalStock, inStock: totalStock > 0 },
		});
	}
};

const updateOrderStatusWithAudit = async (
	orderId: string,
	next: OrderStatus,
	currentStatus: OrderStatus | undefined,
	adminEmail: string | null,
	allowedCurrent?: readonly OrderStatus[],
) => {
	const fallbackCurrentStatus = currentStatus;
	return prisma.$transaction(async (tx): Promise<OrderStatusUpdateResult> => {
		const order = await tx.order.findUnique({
			where: { id: orderId },
			select: { status: true },
		});
		if (!order) {
			return { success: false, reason: 'not-found' };
		}
		const persistedStatus = order.status as OrderStatus;
		if (!canTransitionOrderStatus(persistedStatus, next, allowedCurrent)) {
			return { success: false, reason: 'not-allowed', status: persistedStatus };
		}
		if (persistedStatus === next) {
			return { success: true, changed: false, status: persistedStatus };
		}

		await tx.order.update({
			where: { id: orderId },
			data: { status: next },
		});
		await tx.orderAuditEntry.create({
			data: {
				orderId,
				type: 'STATUS_CHANGE',
				fromStatus: fallbackCurrentStatus ?? persistedStatus,
				toStatus: next,
				adminEmail,
			},
		});
		return { success: true, changed: true, status: persistedStatus };
	});
};

const makeStatusAction = (
	next: OrderStatus,
	allowedCurrent?: OrderStatus[],
): ActionHandler<RecordActionResponse> => {
	return async (req, _res, context) => {
		const { record, resource, currentAdmin } = context;
		if (!record || !resource) {
			throw new Error('Missing record context');
		}
		const method = ((req as { method?: string }).method ?? 'get').toLowerCase();
		if (method !== 'post' && method !== 'delete') {
			return {
				record: record.toJSON(currentAdmin),
			};
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
		const result = await updateOrderStatusWithAudit(
			orderId,
			next,
			currentStatus,
			adminEmail,
			allowedCurrent,
		);
		if (!result.success) {
			return {
				record: record.toJSON(currentAdmin),
				notice: {
					message: result.reason === 'not-found' ? 'order-not-found' : 'status-not-allowed',
					type: 'error',
				},
			};
		}
		const updated = await resource.findOne(orderId);
		return {
			record: updated ? updated.toJSON(currentAdmin) : record.toJSON(currentAdmin),
			notice: { message: 'status-updated', type: 'success', options: { status: next } },
		};
	};
};

const makeBulkStatusAction = (next: OrderStatus): ActionHandler<BulkActionResponse> => {
	return async (req, _res, context) => {
		const { records, resource, currentAdmin } = context;
		if (!records || !resource) {
			throw new Error('Missing record context');
		}
		const method = ((req as { method?: string }).method ?? 'get').toLowerCase();
		if (method !== 'post' && method !== 'delete') {
			return {
				records: records.map((record) => record.toJSON(currentAdmin)),
			};
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
			let updatedCount = 0;
			let blockedCount = 0;
			for (const record of records) {
				const orderId = record.param('id') as string | undefined;
				if (!orderId) continue;
				const currentStatus = record.param('status') as OrderStatus | undefined;
				const result = await updateOrderStatusWithAudit(orderId, next, currentStatus, adminEmail);
				if (!result.success) {
					blockedCount += 1;
					continue;
				}
				if (result.changed) {
					updatedCount += 1;
				}
			}
			const refreshed = await Promise.all(ids.map((id) => resource.findOne(id)));
			const jsonRecords = refreshed.filter(Boolean).map((record) => record!.toJSON(currentAdmin));
			if (updatedCount === 0 && blockedCount > 0) {
				return {
					records: jsonRecords,
					notice: { message: 'bulk-status-update-failed', type: 'error' },
				};
			}
			return {
				records: jsonRecords,
				notice: {
					message: 'bulk-status-updated',
					type: 'success',
					options: { status: next, count: updatedCount },
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
	const paymentIntentId = typeof paymentIntent === 'string' ? paymentIntent : paymentIntent?.id;
	if (!paymentIntentId) {
		throw new Error('refund-unavailable');
	}
	await stripe.refunds.create({
		payment_intent: paymentIntentId,
		reason: 'requested_by_customer',
	});
};

const refundStripeSessionAmount = async (
	stripeSessionId: string,
	amount: number,
	idempotencyKey?: string,
) => {
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
	const paymentIntentId = typeof paymentIntent === 'string' ? paymentIntent : paymentIntent?.id;
	if (!paymentIntentId) {
		throw new Error('refund-unavailable');
	}
	const amountCents = Math.max(0, Math.round(amount * 100));
	if (!amountCents) {
		throw new Error('refund-unavailable');
	}
	await stripe.refunds.create(
		{
			payment_intent: paymentIntentId,
			amount: amountCents,
			reason: 'requested_by_customer',
		},
		idempotencyKey ? { idempotencyKey } : {},
	);
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
	const validStatuses: OrderStatus[] = [
		'PENDING',
		'PAID',
		'SHIPPED',
		'DELIVERED',
		'CANCELLED',
		'RETURNED',
	];
	if (!validStatuses.includes(requested)) {
		return {
			record: record.toJSON(currentAdmin),
			notice: { message: 'invalid-status', type: 'error' },
		};
	}

	if (requested === 'CANCELLED') {
		const orderId = record.param('id') as string;
		const adminEmail = resolveAdminEmail(currentAdmin);
		const result = await prisma.$transaction(async (tx) => {
			const order = await tx.order.findUnique({
				where: { id: orderId },
				select: { status: true },
			});
			if (!order) {
				return { success: false as const, reason: 'not-found' as const };
			}
			const currentStatus = order.status as OrderStatus;
			if (!canTransitionOrderStatus(currentStatus, 'CANCELLED')) {
				return { success: false as const, reason: 'not-allowed' as const, status: currentStatus };
			}
			if (currentStatus === 'CANCELLED') {
				return { success: true as const, changed: false as const };
			}

			await restockOrderInventory(tx, orderId);
			await tx.order.update({
				where: { id: orderId },
				data: { status: 'CANCELLED' },
			});
			await tx.orderAuditEntry.create({
				data: {
					orderId,
					type: 'STATUS_CHANGE',
					fromStatus: currentStatus,
					toStatus: 'CANCELLED',
					adminEmail,
					note: 'Cancelled',
				},
			});
			await tx.orderAuditEntry.create({
				data: {
					orderId,
					type: 'NOTE',
					note: INVENTORY_RESTOCKED_NOTE,
					adminEmail,
				},
			});
			return { success: true as const, changed: true as const };
		});
		if (!result.success) {
			return {
				record: record.toJSON(currentAdmin),
				notice: {
					message: result.reason === 'not-found' ? 'order-not-found' : 'status-not-allowed',
					type: 'error',
				},
			};
		}
		const updated = await resource.findOne(orderId);
		return {
			record: updated ? updated.toJSON(currentAdmin) : record.toJSON(currentAdmin),
			notice: { message: 'status-updated', type: 'success', options: { status: requested } },
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
	const { record, resource, currentAdmin, h } = context;
	const method = ((req as { method?: string }).method ?? 'get').toLowerCase();
	const payload = (req as { payload?: Record<string, unknown> }).payload ?? {};
	const refundRequested = String(payload.refund ?? 'false') === 'true';

	if (!record || !resource) {
		throw new Error('Missing record context');
	}

	const orderId = record.param('id') as string;
	const resourceId =
		typeof (resource as any).id === 'function' ? (resource as any).id() : (resource as any).id;
	const orderSnapshot = await prisma.order.findUnique({
		where: { id: orderId },
		select: { status: true, stripeSessionId: true },
	});
	if (!orderSnapshot) {
		return {
			record: record.toJSON(currentAdmin),
			notice: { message: 'order-not-found', type: 'error' },
			redirectUrl: h.resourceUrl({ resourceId }),
		};
	}
	if (method === 'get') {
		return {
			record: record.toJSON(currentAdmin),
		};
	}
	if (
		orderSnapshot.status === 'CANCELLED' ||
		orderSnapshot.status === 'DELIVERED' ||
		orderSnapshot.status === 'RETURNED'
	) {
		return {
			record: record.toJSON(currentAdmin),
			notice: {
				message: 'order-not-cancellable-status',
				type: 'error',
				options: { status: orderSnapshot.status },
			},
		};
	}

	if (refundRequested) {
		if (!orderSnapshot.stripeSessionId) {
			return {
				record: record.toJSON(currentAdmin),
				notice: { message: 'refund-unavailable', type: 'error' },
			};
		}
		try {
			await refundStripeSession(orderSnapshot.stripeSessionId);
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
	const result = await prisma.$transaction(async (tx) => {
		const order = await tx.order.findUnique({
			where: { id: orderId },
			select: { status: true },
		});
		if (!order) {
			return { success: false as const, reason: 'not-found' as const };
		}
		if (
			order.status === 'CANCELLED' ||
			order.status === 'DELIVERED' ||
			order.status === 'RETURNED'
		) {
			return { success: false as const, reason: 'blocked' as const, status: order.status };
		}

		await restockOrderInventory(tx, orderId);
		await tx.order.update({
			where: { id: orderId },
			data: { status: 'CANCELLED' },
		});
		await tx.orderAuditEntry.create({
			data: {
				orderId,
				type: 'STATUS_CHANGE',
				fromStatus: order.status ?? null,
				toStatus: 'CANCELLED',
				adminEmail,
				note: refundRequested ? 'Cancelled and refunded' : 'Cancelled',
			},
		});

		await tx.orderAuditEntry.create({
			data: {
				orderId,
				type: 'NOTE',
				note: INVENTORY_RESTOCKED_NOTE,
				adminEmail,
			},
		});

		return { success: true as const };
	});

	if (!result.success) {
		if (result.reason === 'not-found') {
			return {
				record: record.toJSON(currentAdmin),
				notice: { message: 'order-not-found', type: 'error' },
				redirectUrl: h.resourceUrl({ resourceId }),
			};
		}
		return {
			record: record.toJSON(currentAdmin),
			notice: {
				message: 'order-not-cancellable-status',
				type: 'error',
				options: { status: result.status },
			},
		};
	}

	const updated = await resource.findOne(orderId);
	return {
		record: updated ? updated.toJSON(currentAdmin) : record.toJSON(currentAdmin),
		notice: {
			message: refundRequested ? 'order-cancelled-refunded' : 'order-cancelled',
			type: 'success',
		},
	};
};

export const deleteOrder: ActionHandler<RecordActionResponse> = async (req, _res, context) => {
	const { record, resource, currentAdmin, h } = context;
	const method = ((req as { method?: string }).method ?? 'get').toLowerCase();
	if (!record || !resource) {
		throw new Error('Missing record context');
	}
	if (method === 'get') {
		return {
			record: record.toJSON(currentAdmin),
		};
	}

	if (method !== 'post' && method !== 'delete') {
		return {
			record: record.toJSON(currentAdmin),
			notice: { message: 'order-delete-method-not-allowed', type: 'error' },
		};
	}
	const orderId = record.param('id') as string;
	const resourceId =
		typeof (resource as any).id === 'function' ? (resource as any).id() : (resource as any).id;
	try {
		await prisma.$transaction(async (tx) => {
			const order = await tx.order.findUnique({
				where: { id: orderId },
				select: { status: true },
			});
			if (!order) {
				throw new Error('order-not-found');
			}

			if (order.status === 'PENDING' || order.status === 'PAID') {
				await restockOrderInventory(tx, orderId);
			}
			if (order.status === 'CANCELLED') {
				const restocked = await tx.orderAuditEntry.findFirst({
					where: { orderId, type: 'NOTE', note: INVENTORY_RESTOCKED_NOTE },
					select: { id: true },
				});
				if (!restocked) {
					await restockOrderInventory(tx, orderId);
				}
			}
			await tx.orderItem.deleteMany({ where: { orderId } });
			await tx.order.delete({ where: { id: orderId } });
		});
		return {
			record: record.toJSON(currentAdmin),
			notice: { message: 'order-deleted', type: 'success' },
			redirectUrl: h.resourceUrl({ resourceId }),
		};
	} catch (error) {
		if (error instanceof Error && error.message === 'order-not-found') {
			return {
				record: record.toJSON(currentAdmin),
				notice: { message: 'order-not-found', type: 'error' },
				redirectUrl: h.resourceUrl({ resourceId }),
			};
		}

		console.error('[admin] Failed to delete order', { orderId, error });
		return {
			record: record.toJSON(currentAdmin),
			notice: { message: 'order-delete-failed', type: 'error' },
		};
	}
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
		select: { total: true, stripeSessionId: true, status: true, refundedAt: true },
	});

	if (!order) {
		return {
			record: record.toJSON(currentAdmin),
			notice: { message: 'order-not-found', type: 'error' },
		};
	}

	if (!isReturnableOrderStatus(order.status as OrderStatus) || order.refundedAt) {
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
			await refundStripeSessionAmount(
				order.stripeSessionId,
				refundAmount,
				`order-return:${orderId}`,
			);
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
