import type { ActionHandler, RecordActionResponse } from 'adminjs';
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

type OrderItemSummary = {
	id: string;
	productId: string;
	productName: string;
	productImageUrl: string | null;
	quantity: number;
	unitPrice: number;
	lineTotal: number;
};

type OrderItemsPayload = {
	items: OrderItemSummary[];
};

export const orderItemsSummary: ActionHandler<RecordActionResponse> = async (_req, _res, context) => {
	const { record, currentAdmin } = context;
	if (!record) {
		throw new Error('Missing record context');
	}

	const orderId = record.param('id') as string;

	const items = await prisma.orderItem.findMany({
		where: { orderId },
		orderBy: { product: { name: 'asc' } },
		select: {
			id: true,
			quantity: true,
			price: true,
			unitPrice: true,
			productId: true,
			product: { select: { name: true, imageUrl: true } },
		},
	});

	const payload: OrderItemsPayload = {
		items: items.map((item) => ({
			id: item.id,
			productId: item.productId,
			productName: item.product?.name ?? '-',
			productImageUrl: item.product?.imageUrl ?? null,
			quantity: item.quantity,
			unitPrice: toNumber(item.unitPrice),
			lineTotal: toNumber(item.price),
		})),
	};

	return {
		record: record.toJSON(currentAdmin),
		payload,
	};
};
