import type { ActionHandler, BulkActionResponse, RecordActionResponse } from 'adminjs';
import { prisma } from '../prisma.mts';

type ShippingLabelPayload = {
	orderId: string;
	createdAt: string;
	status: string;
	contactName: string | null;
	contactLastName: string | null;
	contactEmail: string | null;
	contactPhone: string | null;
	shipmentMethod: string | null;
	carrier: string | null;
	trackingNumber: string | null;
	shippingAddress: string | null;
	shippingCountry: string | null;
	shippingRegion: string | null;
	shippingCity: string | null;
	shippingPostalCode: string | null;
	shippingAddressLine1: string | null;
	shippingAddressLine2: string | null;
};

type BulkShippingLabelsPayload = {
	orders: ShippingLabelPayload[];
};

const buildShippingLabelPayload = (order: {
	id: string;
	createdAt: Date;
	status: unknown;
	contactName: string | null;
	contactLastName: string | null;
	contactEmail: string | null;
	contactPhone: string | null;
	shipmentMethod: string | null;
	carrier: string | null;
	trackingNumber: string | null;
	shippingAddress: string | null;
	shippingCountry: string | null;
	shippingRegion: string | null;
	shippingCity: string | null;
	shippingPostalCode: string | null;
	shippingAddressLine1: string | null;
	shippingAddressLine2: string | null;
}): ShippingLabelPayload => ({
	orderId: order.id,
	createdAt: order.createdAt.toISOString(),
	status: String(order.status),
	contactName: order.contactName ?? null,
	contactLastName: order.contactLastName ?? null,
	contactEmail: order.contactEmail ?? null,
	contactPhone: order.contactPhone ?? null,
	shipmentMethod: order.shipmentMethod ?? null,
	carrier: order.carrier ?? null,
	trackingNumber: order.trackingNumber ?? null,
	shippingAddress: order.shippingAddress ?? null,
	shippingCountry: order.shippingCountry ?? null,
	shippingRegion: order.shippingRegion ?? null,
	shippingCity: order.shippingCity ?? null,
	shippingPostalCode: order.shippingPostalCode ?? null,
	shippingAddressLine1: order.shippingAddressLine1 ?? null,
	shippingAddressLine2: order.shippingAddressLine2 ?? null,
});

export const shippingLabel: ActionHandler<RecordActionResponse> = async (_req, _res, context) => {
	const { record, currentAdmin } = context;
	if (!record) {
		throw new Error('Missing record context');
	}

	const orderId = record.param('id') as string;
	const order = await prisma.order.findUnique({
		where: { id: orderId },
		select: {
			id: true,
			createdAt: true,
			status: true,
			contactName: true,
			contactLastName: true,
			contactEmail: true,
			contactPhone: true,
			shipmentMethod: true,
			carrier: true,
			trackingNumber: true,
			shippingAddress: true,
			shippingCountry: true,
			shippingRegion: true,
			shippingCity: true,
			shippingPostalCode: true,
			shippingAddressLine1: true,
			shippingAddressLine2: true,
		},
	});

	if (!order) {
		return {
			record: record.toJSON(currentAdmin),
			payload: null,
			notice: { message: 'shipping-label-load-failed', type: 'error' },
		};
	}

	return {
		record: record.toJSON(currentAdmin),
		payload: buildShippingLabelPayload(order),
	};
};

export const bulkShippingLabels: ActionHandler<BulkActionResponse> = async (_req, _res, context) => {
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
		select: {
			id: true,
			createdAt: true,
			status: true,
			contactName: true,
			contactLastName: true,
			contactEmail: true,
			contactPhone: true,
			shipmentMethod: true,
			carrier: true,
			trackingNumber: true,
			shippingAddress: true,
			shippingCountry: true,
			shippingRegion: true,
			shippingCity: true,
			shippingPostalCode: true,
			shippingAddressLine1: true,
			shippingAddressLine2: true,
		},
	});

	const orderMap = new Map(orders.map((order) => [order.id, order]));
	const payload: BulkShippingLabelsPayload = {
		orders: ids
			.map((id) => orderMap.get(id))
			.filter(Boolean)
			.map((order) => buildShippingLabelPayload(order!)),
	};

	return {
		records: records.map((record) => record.toJSON(currentAdmin)),
		payload,
	};
};
