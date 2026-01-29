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
	unitPrice: number;
	price: number;
	product: OrderProduct;
};

export type UserOrder = {
	id: string;
	total: number;
	status: string;
	createdAt: Date;
	paymentMethod: string | null;
	shipmentMethod: string | null;
	items: OrderItem[];
	orderNumber?: string | null;
};

export type OrderDetailTag = {
	key: 'status' | 'payment' | 'shipment';
	label: string;
	value: string;
	colorPalette?: string;
	icon?: IconType | null;
};
