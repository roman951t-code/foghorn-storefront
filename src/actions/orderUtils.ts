'use server';

import 'server-only';

import type { OrderItem, UserOrder } from '@/types/order';
import { resolveProductPrimaryImageFromGallery } from '@/utils/productImages';
import { buildLocalizedVariantLabel } from '@/utils/attributeLocalization';
import { roundPrice, toNumber } from '@/utils/priceFormatting';

const resolveDisplayVariantLabel = (
	snapshotVariantLabel: unknown,
	attributes: any[] | undefined | null,
	locale: string | null | undefined
): string | null => {
	const localizedLabel = buildLocalizedVariantLabel(
		attributes?.map((a) => ({ name: a.attribute?.name, value: a.value, unit: a.attribute?.unit })),
		locale
	);
	if (localizedLabel) return localizedLabel;

	if (typeof snapshotVariantLabel !== 'string') return null;
	const snapshotLabel = snapshotVariantLabel.trim();
	return snapshotLabel || null;
};

export async function normalizeOrder(order: any, locale?: string | null): Promise<UserOrder> {
	const items: OrderItem[] =
		order?.items?.map((item: any) => ({
			id: item.id,
			productId: item.productId,
			variantId: item.variant?.id ?? item.variantId ?? null,
			sku: item.snapshotVariantSku ?? item.variant?.sku ?? null,
			variantLabel: resolveDisplayVariantLabel(item.snapshotVariantLabel, item.variant?.attributes, locale),
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

	const itemDiscountTotal = roundPrice(
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

	const promoDiscountTotal = roundPrice(
		discountRows.reduce((sum: number, d: any) => sum + toNumber(d?.amount ?? 0), 0)
	);

	const totalDiscount = roundPrice(itemDiscountTotal + promoDiscountTotal);
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
