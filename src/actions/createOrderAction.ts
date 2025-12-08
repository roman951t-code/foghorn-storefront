'use server';

import { Prisma } from '@prisma/client';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { normalizeOrder } from './orderUtils';
import type { UserOrder } from '@/types/order';

type CreateOrderItemPayload = { productId: string; quantity: number };

export type CreateOrderPayload = {
	items: CreateOrderItemPayload[];
	paymentMethod?: string;
	shipmentMethod?: string;
};

type CreateOrderResult =
	| { success: true; order: UserOrder }
	| { success: false; message?: string };

export async function createOrderAction(
	_: unknown,
	payload: CreateOrderPayload
): Promise<CreateOrderResult> {
	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id;

	if (!userId) {
		return { success: false, message: 'unauthorized' };
	}

	const rawItems = payload?.items ?? [];
	const filteredItems = rawItems
		.map((item) => ({
			productId: item.productId,
			quantity: Math.max(1, Math.floor(item.quantity ?? 1)),
		}))
		.filter((item) => item.productId);

	if (!filteredItems.length) {
		return { success: false, message: 'empty-items' };
	}

	const uniqueIds = Array.from(new Set(filteredItems.map((i) => i.productId)));
	const products = await prisma.product.findMany({
		where: { id: { in: uniqueIds } },
		select: {
			id: true,
			name: true,
			fullSlug: true,
			imageUrl: true,
			basePrice: true,
			discountPrice: true,
		},
	});

	const productMap = new Map(products.map((p) => [p.id, p]));

	const toCurrency = (value: number) => Math.round(value * 100) / 100;

	const orderItems = filteredItems
		.map((item) => {
			const product = productMap.get(item.productId);
			if (!product) return null;
			const unitPrice = toCurrency(Number(product.discountPrice ?? product.basePrice ?? 0));
			const quantity = Math.max(1, item.quantity);
			const price = toCurrency(unitPrice * quantity);
			return {
				productId: item.productId,
				quantity,
				unitPrice,
				price,
			};
		})
		.filter(Boolean) as { productId: string; quantity: number; unitPrice: number; price: number }[];

	if (!orderItems.length) {
		return { success: false, message: 'invalid-items' };
	}

	const total = orderItems.reduce((acc, item) => acc + item.price, 0);
	const roundedTotal = Math.round(total * 100) / 100;

	const order = await prisma.order.create({
		data: {
			userId,
			total: new Prisma.Decimal(roundedTotal.toFixed(2)),
			paymentMethod: payload.paymentMethod ?? null,
			shipmentMethod: payload.shipmentMethod ?? null,
			contactName: session.user?.name ?? null,
			contactLastName: session.user?.lastName ?? null,
			contactMiddleName: session.user?.middleName ?? null,
			contactEmail: session.user?.email ?? null,
			contactPhone: session.user?.phoneNumber ?? null,
			items: {
				create: orderItems.map((item) => ({
					productId: item.productId,
					quantity: item.quantity,
					unitPrice: new Prisma.Decimal(item.unitPrice.toFixed(2)),
					price: new Prisma.Decimal(item.price.toFixed(2)),
				})),
			},
		},
		include: {
			items: {
				include: {
					product: {
						select: {
							id: true,
							name: true,
							fullSlug: true,
							imageUrl: true,
						},
					},
				},
			},
		},
	});

	const normalized = await normalizeOrder(order);
	return { success: true, order: normalized };
}
