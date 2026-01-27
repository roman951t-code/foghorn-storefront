import type { ActionHandler, BulkActionResponse, RecordActionResponse } from 'adminjs';
import { prisma } from '../prisma.mts';

type PackingSlipItem = {
	name: string;
	quantity: number;
	unitPrice: number;
	price: number;
};

type PackingSlipPayload = {
	orderId: string;
	createdAt: string;
	status: string;
	contactName: string | null;
	contactLastName: string | null;
	contactEmail: string | null;
	contactPhone: string | null;
	paymentMethod: string | null;
	shipmentMethod: string | null;
	carrier: string | null;
	trackingNumber: string | null;
	total: number;
	items: PackingSlipItem[];
};

type BulkPackingPayload = {
	orders: PackingSlipPayload[];
};

const buildPackingPayload = (order: {
	id: string;
	createdAt: Date;
	status: unknown;
	contactName: string | null;
	contactLastName: string | null;
	contactEmail: string | null;
	contactPhone: string | null;
	paymentMethod: string | null;
	shipmentMethod: string | null;
	carrier: string | null;
	trackingNumber: string | null;
	total: unknown;
	items: Array<{
		quantity: number;
		unitPrice: unknown;
		price: unknown;
		product: { name: string | null } | null;
	}>;
}): PackingSlipPayload => {
	const items: PackingSlipItem[] = order.items.map((item) => ({
		name: item.product?.name ?? 'Unknown',
		quantity: item.quantity,
		unitPrice: Number(item.unitPrice ?? 0),
		price: Number(item.price ?? 0),
	}));

	return {
		orderId: order.id,
		createdAt: order.createdAt.toISOString(),
		status: String(order.status),
		contactName: order.contactName ?? null,
		contactLastName: order.contactLastName ?? null,
		contactEmail: order.contactEmail ?? null,
		contactPhone: order.contactPhone ?? null,
		paymentMethod: order.paymentMethod ?? null,
		shipmentMethod: order.shipmentMethod ?? null,
		carrier: order.carrier ?? null,
		trackingNumber: order.trackingNumber ?? null,
		total: Number(order.total ?? 0),
		items,
	};
};

export const packingSlip: ActionHandler<RecordActionResponse> = async (_req, _res, context) => {
	const { record, currentAdmin } = context;
	if (!record) {
		throw new Error('Missing record context');
	}

	const orderId = record.param('id') as string;
	const order = await prisma.order.findUnique({
		where: { id: orderId },
		include: {
			items: {
				include: {
					product: { select: { name: true } },
				},
			},
		},
	});

	if (!order) {
		return {
			record: record.toJSON(currentAdmin),
			payload: null,
			notice: { message: 'packing-slip-load-failed', type: 'error' },
		};
	}

	const payload: PackingSlipPayload = buildPackingPayload(order);

	return {
		record: record.toJSON(currentAdmin),
		payload,
	};
};

export const bulkPackingSlips: ActionHandler<BulkActionResponse> = async (_req, _res, context) => {
	const { records, currentAdmin } = context;
	if (!records) {
		throw new Error('Missing record context');
	}

	const ids = records.map((record) => record.param('id')).filter(Boolean) as string[];
	if (!ids.length) {
		return {
			records: records.map((record) => record.toJSON(currentAdmin)),
			notice: { message: 'bulk-no-records', type: 'error' },
			payload: { orders: [] },
		};
	}

	const orders = await prisma.order.findMany({
		where: { id: { in: ids } },
		include: {
			items: {
				include: {
					product: { select: { name: true } },
				},
			},
		},
	});

	const orderMap = new Map(orders.map((order) => [order.id, order]));
	const payload: BulkPackingPayload = {
		orders: ids
			.map((id) => orderMap.get(id))
			.filter(Boolean)
			.map((order) => buildPackingPayload(order!)),
	};

	return {
		records: records.map((record) => record.toJSON(currentAdmin)),
		payload,
	};
};
