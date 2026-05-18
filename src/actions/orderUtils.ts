'use server';

import 'server-only';

import type { OrderItem, UserOrder } from '@/types/order';
import { resolveProductPrimaryImageFromGallery } from '@/utils/productImages';

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
const buildVariantLabel = (attributes: any[] | undefined | null): string | null => {
	if (!Array.isArray(attributes) || attributes.length === 0) return null;
	const label = attributes
		.map((a) => {
			const name = String(a.attribute?.name ?? '').trim();
			const valueWithUnit = [a.value, a.attribute?.unit].filter(Boolean).join(' ').trim();
			if (name && valueWithUnit) return `${name}: ${valueWithUnit}`;
			return name || valueWithUnit;
		})
		.join(' / ')
		.trim();
	return label || null;
};

const resolveDisplayVariantLabel = (
	snapshotVariantLabel: unknown,
	attributes: any[] | undefined | null
): string | null => {
	const fallbackLabel = buildVariantLabel(attributes);
	if (typeof snapshotVariantLabel !== 'string') return fallbackLabel;

	const snapshotLabel = snapshotVariantLabel.trim();
	if (!snapshotLabel) return fallbackLabel;
	if (snapshotLabel.includes(':')) return snapshotLabel;

	return fallbackLabel ?? snapshotLabel;
};

export async function normalizeOrder(order: any): Promise<UserOrder> {
	const items: OrderItem[] =
		order?.items?.map((item: any) => ({
			id: item.id,
			productId: item.productId,
			variantId: item.variant?.id ?? item.variantId ?? null,
			sku: item.snapshotVariantSku ?? item.variant?.sku ?? null,
			variantLabel: resolveDisplayVariantLabel(item.snapshotVariantLabel, item.variant?.attributes),
			quantity: item.quantity,
			baseUnitPrice: item.baseUnitPrice != null ? toNumber(item.baseUnitPrice) : null,
			unitPrice: Number(item.unitPrice ?? 0),
			price: Number(item.price ?? 0),
			product: {
				id: item.product?.id ?? item.productId,
				name: item.snapshotProductName ?? item.product?.name ?? '',
				fullSlug: item.product?.fullSlug ?? '',
				imageUrl: resolveProductPrimaryImageFromGallery(
					item.product?.imageUrl ?? null,
					item.product?.productImages?.map((image: { url: string }) => image.url) ?? []
				),
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
	const shippingAddressDetails = {
		country: order?.shippingCountry ?? null,
		region: order?.shippingRegion ?? null,
		city: order?.shippingCity ?? null,
		postalCode: order?.shippingPostalCode ?? null,
		addressLine1: order?.shippingAddressLine1 ?? null,
		addressLine2: order?.shippingAddressLine2 ?? null,
	};
	const hasShippingAddressDetails = Object.values(shippingAddressDetails).some((value) => Boolean(value));

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
		shippingAddressDetails: hasShippingAddressDetails ? shippingAddressDetails : null,
		carrier: order.carrier ?? null,
		trackingNumber: order.trackingNumber ?? null,
		items,
		orderNumber: order.id,
	};
}
