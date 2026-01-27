import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { auth } from '@/lib/auth';
import { isSameOriginRequest } from '@/lib/csrf';
import { env } from '@/config/env';
import { isProductPublished } from '@/utils/publishSchedule';
import type Stripe from 'stripe';

type LineItemPayload = { productId: string; quantity: number };

const currency = env.STRIPE_CURRENCY ?? 'usd';

function resolveSafeRedirectUrl(
	value: unknown,
	{ origin, fallbackPath }: { origin: string; fallbackPath: string }
): string {
	const fallback = new URL(fallbackPath, origin).toString();
	if (typeof value !== 'string') return fallback;

	const candidate = value.trim();
	if (!candidate) return fallback;
	if (candidate.length > 2048) return fallback;

	try {
		const url = new URL(candidate, origin);
		return url.origin === origin ? url.toString() : fallback;
	} catch {
		return fallback;
	}
}

export async function POST(req: NextRequest) {
	const bodySchema = z.object({
		items: z
			.array(
				z.object({
					productId: z.string().min(1, 'productId_required'),
					quantity: z.number().int().positive().max(99, 'quantity_too_high'),
				})
			)
			.min(1, 'items_required'),
		successUrl: z.string().url().optional(),
		cancelUrl: z.string().url().optional(),
	});

	try {
		if (!stripe) {
			return NextResponse.json({ error: 'stripe_not_configured' }, { status: 500 });
		}

		const appOrigin = (() => {
			const raw = env.NEXT_PUBLIC_APP_URL;
			if (!raw) return req.nextUrl.origin;
			try {
				return new URL(raw).origin;
			} catch {
				return req.nextUrl.origin;
			}
		})();

		const csrfOk =
			isSameOriginRequest(req, req.nextUrl.origin) || isSameOriginRequest(req, appOrigin);
		if (!csrfOk) {
			return NextResponse.json({ error: 'csrf_failed' }, { status: 403 });
		}

		const requestHeaders = await headers();
		const session = await auth.api.getSession({ headers: requestHeaders });
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
		}

		const parsed = bodySchema.safeParse(await req.json().catch(() => null));
		if (!parsed.success) {
			return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
		}

		const items: LineItemPayload[] = parsed.data.items.map((item) => ({
			productId: item.productId.trim(),
			quantity: Math.max(1, Math.floor(item.quantity)),
		}));

		const uniqueIds = Array.from(new Set(items.map((item) => item.productId)));
		const products = await prisma.product.findMany({
			where: { id: { in: uniqueIds } },
			select: {
				id: true,
				name: true,
				basePrice: true,
				discountPrice: true,
				stock: true,
				inStock: true,
				status: true,
				publishStartAt: true,
				publishEndAt: true,
			},
		});
		const productMap = new Map(products.map((p) => [p.id, p]));

		const lineItems = items
			.map((item) => {
				const product = productMap.get(item.productId);
				if (
					!product ||
					!product.inStock ||
					!isProductPublished(product.status, product.publishStartAt, product.publishEndAt)
				)
					return null;
				const availableStock = product.stock ?? 0;
				if (item.quantity > availableStock) return null;
				const quantity = Math.max(1, Math.floor(item.quantity ?? 1));
				const unitPrice = Number(product.discountPrice ?? product.basePrice ?? 0);
				const unitAmount = Math.max(1, Math.round(unitPrice * 100));

				return {
					quantity,
					price_data: {
						currency,
						product_data: { name: product.name },
						unit_amount: unitAmount,
					},
				};
			})
			.filter(Boolean) as Stripe.Checkout.SessionCreateParams.LineItem[];

		if (!lineItems.length) {
			return NextResponse.json({ error: 'invalid_items' }, { status: 400 });
		}

		const successUrl = resolveSafeRedirectUrl(parsed.data.successUrl, {
			origin: appOrigin,
			fallbackPath: '/cabinet/orders?payment=success&session_id={CHECKOUT_SESSION_ID}',
		});
		const cancelUrl = resolveSafeRedirectUrl(parsed.data.cancelUrl, {
			origin: appOrigin,
			fallbackPath: '/checkout?cancelled=1',
		});

		const checkoutSession = await stripe.checkout.sessions.create({
			mode: 'payment',
			payment_method_types: ['card'],
			locale: 'auto',
			line_items: lineItems,
			success_url: successUrl,
			cancel_url: cancelUrl,
			customer_email: session.user?.email ?? undefined,
			metadata: {
				userId: session.user.id,
				items: JSON.stringify(items),
			},
		});

		return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url });
	} catch (error) {
		return NextResponse.json({ error: 'stripe_session_failed' }, { status: 500 });
	}
}
