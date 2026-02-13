import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { env } from '@/config/env';
import { finalizeStripeOrderAsSystem } from '@/actions/payments/finalizeStripeOrder';
import { recordApi5xxEvent, recordStripeWebhookFailure } from '@/lib/opsMonitoring';

export async function POST(req: Request) {
	if (!stripe) {
		recordApi5xxEvent({
			route: '/api/payments/stripe/webhook',
			statusCode: 500,
			error: 'stripe_not_configured',
		});
		recordStripeWebhookFailure({
			stage: 'not-configured',
			error: 'stripe_not_configured',
		});
		return NextResponse.json({ error: 'stripe_not_configured' }, { status: 500 });
	}

	const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
	if (!webhookSecret) {
		recordApi5xxEvent({
			route: '/api/payments/stripe/webhook',
			statusCode: 500,
			error: 'stripe_webhook_not_configured',
		});
		recordStripeWebhookFailure({
			stage: 'not-configured',
			error: 'stripe_webhook_not_configured',
		});
		return NextResponse.json({ error: 'stripe_webhook_not_configured' }, { status: 500 });
	}

	const signature = req.headers.get('stripe-signature');
	if (!signature) {
		return NextResponse.json({ error: 'missing_signature' }, { status: 400 });
	}

	const rawBody = Buffer.from(await req.arrayBuffer());

	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'invalid_signature';
		return NextResponse.json({ error: 'invalid_signature', message }, { status: 400 });
	}

	try {
		switch (event.type) {
				case 'checkout.session.completed':
				case 'checkout.session.async_payment_succeeded': {
					const session = event.data.object as Stripe.Checkout.Session;
					const result = await finalizeStripeOrderAsSystem(session.id);
					if (!result.success) {
						recordApi5xxEvent({
							route: '/api/payments/stripe/webhook',
							statusCode: 500,
							error: result.message,
						});
						recordStripeWebhookFailure({
							stage: 'finalize-failed',
							error: result.message,
							eventType: event.type,
							sessionId: session.id,
						});
						return NextResponse.json({ error: result.message }, { status: 500 });
					}
					break;
				}
			default:
				break;
		}
	} catch (error) {
		console.error('Stripe webhook handler failed', error);
		const message = error instanceof Error ? error.message : 'webhook_failed';
		recordApi5xxEvent({
			route: '/api/payments/stripe/webhook',
			statusCode: 500,
			error: message,
		});
		recordStripeWebhookFailure({
			stage: 'handler-exception',
			error: message,
			eventType: event.type,
		});
		return NextResponse.json({ error: 'webhook_failed' }, { status: 500 });
	}

	return NextResponse.json({ received: true });
}
