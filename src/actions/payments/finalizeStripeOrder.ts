'use server';

import { Prisma } from '@prisma/client';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { normalizeOrder } from '../orderUtils';
import type { UserOrder } from '@/types/order';

type Result =
	| { success: true; order?: UserOrder }
	| { success: false; message: string };

type OrderItemPayload = { productId: string; quantity: number };

export async function finalizeStripeOrder(sessionId?: string | null): Promise<Result> {
	if (!sessionId) return { success: false, message: 'missing_session' };
	if (!stripe) return { success: false, message: 'stripe_not_configured' };

	const requestHeaders = await headers();
	const session = await auth.api.getSession({ headers: requestHeaders });
	const userId = session?.user?.id;

	if (!userId) return { success: false, message: 'unauthorized' };

	const existing = await prisma.order.findUnique({
		where: { stripeSessionId: sessionId },
		include: {
			items: {
				include: {
					product: { select: { id: true, name: true, fullSlug: true, imageUrl: true } },
				},
			},
		},
	});

	if (existing) {
		const normalized = await normalizeOrder(existing);
		return { success: true, order: normalized };
	}

	const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
		expand: ['line_items'],
	});

	if (checkoutSession.payment_status !== 'paid') {
		return { success: false, message: 'not_paid' };
	}

	const sessionUserId = checkoutSession.metadata?.userId;
	if (sessionUserId && sessionUserId !== userId) {
		return { success: false, message: 'forbidden' };
	}

	let itemsPayload: OrderItemPayload[] = [];
	try {
		const parsed = JSON.parse(checkoutSession.metadata?.items ?? '[]');
		if (Array.isArray(parsed)) {
			itemsPayload = parsed
				.map((item) => ({
					productId: String(item?.productId ?? '').trim(),
					quantity: Math.max(1, Math.floor(item?.quantity ?? 1)),
				}))
				.filter((item) => item.productId);
		}
	} catch {
		// ignore parsing issues
	}

	if (!itemsPayload.length) {
		return { success: false, message: 'no_items' };
	}

	const uniqueIds = Array.from(new Set(itemsPayload.map((i) => i.productId)));
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

	const orderItems = itemsPayload
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
		return { success: false, message: 'invalid_items' };
	}

	const roundedTotal = orderItems.reduce((acc, item) => acc + item.price, 0);
	const decimalTotal = new Prisma.Decimal(roundedTotal.toFixed(2));

	const order = await prisma.$transaction(async (tx) => {
		const created = await tx.order.create({
			data: {
				userId,
				total: decimalTotal,
				paymentMethod: 'card',
				shipmentMethod: null,
				stripeSessionId: sessionId,
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
						product: { select: { id: true, name: true, fullSlug: true, imageUrl: true } },
					},
				},
			},
		});

		// Clear cart for the user after successful paid order
		await tx.cartItem.deleteMany({ where: { cart: { userId } } });

		return created;
	});

	const normalized = await normalizeOrder(order);
	return { success: true, order: normalized };
}
