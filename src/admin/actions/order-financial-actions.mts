import type { ActionHandler, RecordActionResponse } from 'adminjs';
import { prisma } from '../prisma.mts';

type PaymentStatus = 'PAID' | 'UNPAID' | 'CANCELLED';

type FinancialBreakdownPayload = {
	subtotal: number;
	discounts: number;
	shipping: number;
	total: number;
	paymentStatus: PaymentStatus;
	paymentMethod: string | null;
	shipmentMethod: string | null;
};

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

const derivePaymentStatus = (orderStatus: string | null | undefined): PaymentStatus => {
	if (orderStatus === 'CANCELLED') return 'CANCELLED';
	if (orderStatus === 'PAID' || orderStatus === 'SHIPPED' || orderStatus === 'DELIVERED') {
		return 'PAID';
	}
	return 'UNPAID';
};

export const financialBreakdown: ActionHandler<RecordActionResponse> = async (
	_req,
	_res,
	context
) => {
	const { record, currentAdmin } = context;
	if (!record) {
		throw new Error('Missing record context');
	}

	const orderId = record.param('id') as string;
	const order = await prisma.order.findUnique({
		where: { id: orderId },
		include: { items: true },
	});

	if (!order) {
		const payload: FinancialBreakdownPayload = {
			subtotal: 0,
			discounts: 0,
			shipping: 0,
			total: 0,
			paymentStatus: 'UNPAID',
			paymentMethod: null,
			shipmentMethod: null,
		};
		return {
			record: record.toJSON(currentAdmin),
			payload,
		};
	}

	const subtotal = roundCurrency(
		order.items.reduce((acc, item) => acc + Number(item.price ?? 0), 0)
	);
	const discounts = 0;
	const shipping = 0;
	const total = roundCurrency(Number(order.total ?? 0));
	const paymentStatus = derivePaymentStatus(order.status as unknown as string);

	const payload: FinancialBreakdownPayload = {
		subtotal,
		discounts,
		shipping,
		total,
		paymentStatus,
		paymentMethod: order.paymentMethod ?? null,
		shipmentMethod: order.shipmentMethod ?? null,
	};

	return {
		record: record.toJSON(currentAdmin),
		payload,
	};
};
