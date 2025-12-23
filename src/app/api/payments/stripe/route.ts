import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { auth } from '@/lib/auth';
import { isSameOriginRequest } from '@/lib/csrf';
import type Stripe from 'stripe';

type LineItemPayload = { productId: string; quantity: number };

const currency = process.env.STRIPE_CURRENCY ?? 'usd';

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
	try {
		if (!stripe) {
			return NextResponse.json({ error: 'stripe_not_configured' }, { status: 500 });
		}

		const appOrigin = (() => {
			const raw = process.env.NEXT_PUBLIC_APP_URL;
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

		const body = await req.json().catch(() => null);
		const items: LineItemPayload[] = Array.isArray(body?.items) ? body.items : [];

		if (!items.length) {
			return NextResponse.json({ error: 'no_items' }, { status: 400 });
		}

		const sanitizedItems = items
			.map((item) => ({
				productId: String(item.productId ?? '').trim(),
				quantity: Math.max(1, Math.floor(item.quantity ?? 1)),
			}))
			.filter((item) => item.productId);

		const uniqueIds = Array.from(new Set(sanitizedItems.map((item) => item.productId)));
		const products = await prisma.product.findMany({
			where: { id: { in: uniqueIds } },
			select: { id: true, name: true, basePrice: true, discountPrice: true },
		});
		const productMap = new Map(products.map((p) => [p.id, p]));

		const lineItems = sanitizedItems
			.map((item) => {
				const product = productMap.get(item.productId);
				if (!product) return null;
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

		const successUrl = resolveSafeRedirectUrl(body?.successUrl, {
			origin: appOrigin,
			fallbackPath: '/cabinet/orders?payment=success&session_id={CHECKOUT_SESSION_ID}',
		});
		const cancelUrl = resolveSafeRedirectUrl(body?.cancelUrl, {
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
				items: JSON.stringify(sanitizedItems),
			},
		});

		return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url });
	} catch (error) {
		return NextResponse.json({ error: 'stripe_session_failed' }, { status: 500 });
	}
}
