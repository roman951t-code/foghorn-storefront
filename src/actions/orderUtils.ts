'use server';

import 'server-only';

import type { OrderItem, UserOrder } from '@/types/order';

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
			baseUnitPrice: item.baseUnitPrice != null ? toNumber(item.baseUnitPrice) : null,
			unitPrice: Number(item.unitPrice ?? 0),
			price: Number(item.price ?? 0),
			product: {
				id: item.product?.id ?? item.productId,
				name: item.product?.name ?? '',
				fullSlug: item.product?.fullSlug ?? '',
				imageUrl: item.product?.imageUrl ?? null,
			},
		})) ?? [];

	const itemDiscountTotal = roundCurrency(
		items.reduce((sum, item) => {
			const baseUnit = item.baseUnitPrice != null ? item.baseUnitPrice : item.unitPrice;
			const unitDiscount = Math.max(0, (baseUnit ?? 0) - (item.unitPrice ?? 0));
			return sum + unitDiscount * Math.max(1, item.quantity ?? 1);
		}, 0)
	);

	const discountRows = Array.isArray(order?.discounts)
		? order.discounts
		: Array.isArray(order?.orderDiscounts)
			? order.orderDiscounts
			: [];

	const promoDiscountTotal = roundCurrency(
		discountRows.reduce((sum: number, d: any) => sum + toNumber(d?.amount ?? 0), 0)
	);

	const totalDiscount = roundCurrency(itemDiscountTotal + promoDiscountTotal);

	return {
		id: order.id,
		total: Number(order.total ?? 0),
		itemsDiscount: itemDiscountTotal,
		promoDiscount: promoDiscountTotal,
		totalDiscount,
		status: order.status ?? 'PENDING',
		createdAt: order.createdAt,
		paymentMethod: order.paymentMethod ?? null,
		shipmentMethod: order.shipmentMethod ?? null,
		shippingAddress: order.shippingAddress ?? null,
		carrier: order.carrier ?? null,
		trackingNumber: order.trackingNumber ?? null,
		items,
		orderNumber: order.id,
	};
}
