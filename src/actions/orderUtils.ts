'use server';

import 'server-only';

import type { OrderItem, UserOrder } from '@/types/order';

export async function normalizeOrder(order: any): Promise<UserOrder> {
	const items: OrderItem[] =
		order?.items?.map((item: any) => ({
			id: item.id,
			productId: item.productId,
			variantId: item.variant?.id ?? item.variantId ?? null,
			sku: item.variant?.sku ?? null,
			variantLabel: Array.isArray(item.variant?.attributes)
				? item.variant.attributes
						.map((a: any) =>
							[a.attribute?.name, a.value, a.attribute?.unit].filter(Boolean).join(' ')
						)
						.join(' / ')
				: null,
			quantity: item.quantity,
			unitPrice: Number(item.unitPrice ?? 0),
			price: Number(item.price ?? 0),
			product: {
				id: item.product?.id ?? item.productId,
				name: item.product?.name ?? '',
				fullSlug: item.product?.fullSlug ?? '',
				imageUrl: item.product?.imageUrl ?? null,
			},
		})) ?? [];

	return {
		id: order.id,
		total: Number(order.total ?? 0),
		status: order.status ?? 'PENDING',
		createdAt: order.createdAt,
		paymentMethod: order.paymentMethod ?? null,
		shipmentMethod: order.shipmentMethod ?? null,
		carrier: order.carrier ?? null,
		trackingNumber: order.trackingNumber ?? null,
		items,
		orderNumber: order.id,
	};
}
