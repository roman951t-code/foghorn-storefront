import type { ActionHandler, RecordActionResponse } from 'adminjs';
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

	const items: PackingSlipItem[] = order.items.map((item) => ({
		name: item.product?.name ?? 'Unknown',
		quantity: item.quantity,
		unitPrice: Number(item.unitPrice ?? 0),
		price: Number(item.price ?? 0),
	}));

	const payload: PackingSlipPayload = {
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

	return {
		record: record.toJSON(currentAdmin),
		payload,
	};
};
