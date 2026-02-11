import type { IconType } from 'react-icons';

export type OrderProduct = {
	id: string;
	name: string;
	fullSlug: string;
	imageUrl: string | null;
};

export type OrderItem = {
	id: string;
	productId: string;
	variantId: string | null;
	sku: string | null;
	variantLabel: string | null;
	quantity: number;
	baseUnitPrice?: number | null;
	unitPrice: number;
	price: number;
	product: OrderProduct;
};

export type OrderShippingAddress = {
	country: string | null;
	region: string | null;
	city: string | null;
	postalCode: string | null;
	addressLine1: string | null;
	addressLine2: string | null;
};

export type UserOrder = {
	id: string;
	total: number;
	itemsDiscount: number;
	promoDiscount: number;
	totalDiscount: number;
	status: string;
	createdAt: Date;
	paymentMethod: string | null;
	shipmentMethod: string | null;
	shippingAddress: string | null;
	shippingAddressDetails: OrderShippingAddress | null;
	carrier: string | null;
	trackingNumber: string | null;
	items: OrderItem[];
	orderNumber?: string | null;
};

export type OrderDetailTag = {
	key: 'status' | 'payment' | 'shipment' | 'tracking';
	label: string;
	value: string;
	colorPalette?: string;
	icon?: IconType | null;
};
