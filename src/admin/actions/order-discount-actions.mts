import type { ActionContext, ActionRequest, ActionResponse } from 'adminjs';
import { Prisma } from '@prisma/client';
import { prisma } from '../prisma.mts';

const toNumber = (value: unknown): number => {
	if (typeof value === 'number') return value;
	if (typeof value === 'bigint') return Number(value);
	if (typeof value === 'string') return Number(value);
	if (value && typeof value === 'object' && 'toNumber' in value && typeof (value as any).toNumber === 'function') {
		return (value as any).toNumber();
	}
	return Number(value);
};

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

const resolveOrderId = (
	response: ActionResponse | undefined,
	request: ActionRequest | undefined,
	context: ActionContext | undefined
): string | null => {
	const responseOrderId =
		(response as { record?: { params?: { orderId?: unknown } } })?.record?.params?.orderId ?? null;
	if (typeof responseOrderId === 'string' && responseOrderId.trim()) return responseOrderId;
	const contextOrderId = context?.record?.param?.('orderId');
	if (typeof contextOrderId === 'string' && contextOrderId.trim()) return contextOrderId;
	const payloadOrderId = (request as { payload?: { orderId?: unknown } })?.payload?.orderId ?? null;
	if (typeof payloadOrderId === 'string' && payloadOrderId.trim()) return payloadOrderId;
	return null;
};

const recalcOrderTotal = async (orderId: string): Promise<void> => {
	const [itemsAgg, discountsAgg] = await prisma.$transaction([
		prisma.orderItem.aggregate({
			where: { orderId },
			_sum: { price: true },
		}),
		prisma.orderDiscount.aggregate({
			where: { orderId },
			_sum: { amount: true },
		}),
	]);

	const subtotal = toNumber(itemsAgg._sum.price ?? 0);
	const discountTotal = toNumber(discountsAgg._sum.amount ?? 0);
	const total = Math.max(0, roundCurrency(subtotal - discountTotal));

	await prisma.order.update({
		where: { id: orderId },
		data: { total: new Prisma.Decimal(total.toFixed(2)) },
	});
};

export const syncOrderTotalsAfterDiscountChange = async (
	response: ActionResponse,
	request: ActionRequest,
	context: ActionContext
): Promise<ActionResponse> => {
	const orderId = resolveOrderId(response, request, context);
	if (!orderId) return response;
	try {
		await recalcOrderTotal(orderId);
	} catch {
		// Best-effort recalculation for admin-side edits.
	}
	return response;
};
