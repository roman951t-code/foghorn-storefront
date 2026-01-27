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
	discountDetails: DiscountDetail[];
};

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

const toNumber = (value: unknown): number => {
	if (typeof value === 'number') return value;
	if (typeof value === 'bigint') return Number(value);
	if (typeof value === 'string') return Number(value);
	if (value && typeof value === 'object' && 'toNumber' in value && typeof (value as any).toNumber === 'function') {
		return (value as any).toNumber();
	}
	return Number(value);
};

type DiscountDetail = {
	id: string;
	label: string | null;
	code: string | null;
	amount: number;
};

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
		include: {
			items: true,
			discounts: {
				orderBy: { createdAt: 'asc' },
				include: {
					promotion: { select: { name: true } },
					coupon: { select: { code: true } },
				},
			},
		},
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
			discountDetails: [],
		};
		return {
			record: record.toJSON(currentAdmin),
			payload,
		};
	}

	const subtotal = roundCurrency(
		order.items.reduce((acc, item) => acc + Number(item.price ?? 0), 0)
	);
	const discountDetails: DiscountDetail[] = (order.discounts ?? []).map((discount) => {
		const promotionName = discount.promotion?.name ?? null;
		const couponCode = discount.coupon?.code ?? null;
		const label =
			discount.label ??
			discount.code ??
			couponCode ??
			promotionName ??
			null;
		return {
			id: discount.id,
			label,
			code: discount.code ?? couponCode ?? null,
			amount: roundCurrency(toNumber(discount.amount ?? 0)),
		};
	});
	const discounts = roundCurrency(
		discountDetails.reduce((acc, detail) => acc + detail.amount, 0)
	);
	const shipping = 0;
	const total = roundCurrency(Math.max(0, subtotal - discounts + shipping));
	const paymentStatus = derivePaymentStatus(order.status as unknown as string);

	const payload: FinancialBreakdownPayload = {
		subtotal,
		discounts,
		shipping,
		total,
		paymentStatus,
		paymentMethod: order.paymentMethod ?? null,
		shipmentMethod: order.shipmentMethod ?? null,
		discountDetails,
	};

	return {
		record: record.toJSON(currentAdmin),
		payload,
	};
};
