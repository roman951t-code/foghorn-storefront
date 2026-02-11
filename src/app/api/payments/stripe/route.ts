import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { z } from 'zod';
import { DEFAULT_LOCALE } from '@/constants/locales';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { auth } from '@/lib/auth';
import { isSameOriginRequest } from '@/lib/csrf';
import { env } from '@/config/env';
import { STORE_CURRENCY_CODE_LOWER } from '@/config/currency';
import { isProductPublished } from '@/utils/publishSchedule';
import { getEffectiveDiscountPrice } from '@/utils/discountSchedule';
import { getLocaleFallbacks, pickLocalizedTranslation } from '@/utils/localeFallback';
import type Stripe from 'stripe';
import { getCouponDiscountPreview } from '@/lib/coupons';

type LineItemPayload = { productId: string; variantId: string | null; quantity: number };

const currency = STORE_CURRENCY_CODE_LOWER;

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
					variantId: z.string().nullable(),
					quantity: z.number().int().positive().max(99, 'quantity_too_high'),
				})
			)
			.min(1, 'items_required'),
		couponCode: z.string().optional(),
		shipmentMethod: z.string().max(64).optional(),
		shippingAddress: z.string().max(500).optional(),
		locale: z.string().trim().toLowerCase().max(16).optional(),
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
		const locale = parsed.data.locale || DEFAULT_LOCALE;
		const localeFallbacks = getLocaleFallbacks(locale);

		const items: LineItemPayload[] = parsed.data.items.map((item) => ({
			productId: item.productId.trim(),
			variantId: item.variantId ? item.variantId.trim() : null,
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
				discountStartAt: true,
				discountEndAt: true,
				stock: true,
				inStock: true,
				status: true,
				publishStartAt: true,
				publishEndAt: true,
				translations: {
					where: { locale: { in: localeFallbacks } },
					select: { locale: true, name: true },
					orderBy: { updatedAt: 'desc' },
				},
			},
		});
		const productMap = new Map(products.map((p) => [p.id, p]));

		const uniqueVariantIds = Array.from(
			new Set(items.map((i) => i.variantId).filter((v): v is string => !!v))
		);
		const variants = uniqueVariantIds.length
			? await prisma.productVariant.findMany({
					where: { id: { in: uniqueVariantIds } },
					select: {
						id: true,
						productId: true,
						sku: true,
						price: true,
						stock: true,
						attributes: {
							select: {
								attribute: { select: { name: true, unit: true } },
								value: true,
							},
							orderBy: { attribute: { name: 'asc' } },
						},
					},
				})
			: [];
		const variantById = new Map(variants.map((v) => [v.id, v]));

		const productsNeedingDefaultVariant = items
			.filter((i) => !i.variantId)
			.map((i) => i.productId);
		const defaultVariants = productsNeedingDefaultVariant.length
			? await prisma.productVariant.findMany({
					where: { productId: { in: productsNeedingDefaultVariant }, stock: { gt: 0 } },
					select: {
						id: true,
						productId: true,
						sku: true,
						price: true,
						stock: true,
						attributes: {
							select: {
								attribute: { select: { name: true, unit: true } },
								value: true,
							},
							orderBy: { attribute: { name: 'asc' } },
						},
					},
					orderBy: [{ productId: 'asc' }, { price: 'asc' }, { createdAt: 'asc' }],
				})
			: [];
		const defaultVariantByProduct = new Map<string, (typeof defaultVariants)[number]>();
		for (const v of defaultVariants) {
			if (!defaultVariantByProduct.has(v.productId)) defaultVariantByProduct.set(v.productId, v);
		}

		const lineItems = items
			.map((item) => {
				const product = productMap.get(item.productId);
				if (
					!product ||
					!product.inStock ||
					!isProductPublished(product.status, product.publishStartAt, product.publishEndAt)
				)
					return null;

				const variant =
					(item.variantId ? variantById.get(item.variantId) ?? null : null) ??
					(defaultVariantByProduct.get(item.productId) ?? null);
				if (!variant || variant.productId !== item.productId) return null;

				const availableStock = variant.stock ?? 0;
				if (item.quantity > availableStock) return null;
				const quantity = Math.max(1, Math.floor(item.quantity ?? 1));

				const productBase = product.basePrice?.toNumber?.() ?? 0;
				const effectiveProductDiscount = getEffectiveDiscountPrice(
					productBase,
					product.discountPrice?.toNumber?.() ?? null,
					product.discountStartAt ?? null,
					product.discountEndAt ?? null
				);
				const discountAmount =
					effectiveProductDiscount != null ? Math.max(0, productBase - effectiveProductDiscount) : 0;

				const variantBase = variant.price?.toNumber?.() ?? 0;
				const effectiveVariantPrice = discountAmount > 0 ? Math.max(0, variantBase - discountAmount) : variantBase;
				const unitAmount = Math.max(1, Math.round(effectiveVariantPrice * 100));
				const translation = pickLocalizedTranslation(product.translations, locale);
				const displayProductName = translation?.name ?? product.name;

				const variantLabel =
					variant.attributes?.length
						? variant.attributes
								.map((a) => [a.attribute.name, a.value, a.attribute.unit].filter(Boolean).join(' '))
								.join(' / ')
						: null;

				return {
					quantity,
					price_data: {
						currency,
						product_data: {
							name: variantLabel ? `${displayProductName} (${variantLabel})` : displayProductName,
						},
						unit_amount: unitAmount,
					},
				};
			})
			.filter(Boolean) as Stripe.Checkout.SessionCreateParams.LineItem[];

		if (!lineItems.length) {
			return NextResponse.json({ error: 'invalid_items' }, { status: 400 });
		}

		const rawCouponCode = parsed.data.couponCode?.trim() ?? '';
		const shipmentMethod = parsed.data.shipmentMethod?.trim() || null;
		const shippingAddress = parsed.data.shippingAddress?.trim() || null;
		let resolvedCouponCode: string | null = null;
		let resolvedCouponAmount: number | null = null;
		let stripeCouponId: string | null = null;
		if (rawCouponCode) {
			const subtotal = lineItems.reduce((sum, li) => {
				const unit = li.price_data?.unit_amount ?? 0;
				const qty = li.quantity ?? 1;
				return sum + unit * qty;
			}, 0);
			const subtotalCurrency = subtotal / 100;
			const previewRes = await getCouponDiscountPreview(rawCouponCode, subtotalCurrency);
			if (!previewRes.ok) {
				return NextResponse.json({ error: previewRes.error }, { status: 400 });
			}

			const discountCents = Math.max(0, Math.round(previewRes.preview.amount * 100));
			if (discountCents >= subtotal) {
				return NextResponse.json({ error: 'discount_too_large' }, { status: 400 });
			}

			const stripeCoupon = await stripe.coupons.create({
				duration: 'once',
				amount_off: discountCents,
				currency,
				name: (previewRes.preview.label || previewRes.preview.code).slice(0, 40),
				metadata: {
					appCouponCode: previewRes.preview.code,
					appCouponId: previewRes.preview.couponId,
					appPromotionId: previewRes.preview.promotionId,
				},
			});

			resolvedCouponCode = previewRes.preview.code;
			resolvedCouponAmount = previewRes.preview.amount;
			stripeCouponId = stripeCoupon.id;
		}

		const successUrl = resolveSafeRedirectUrl(parsed.data.successUrl, {
			origin: appOrigin,
			fallbackPath: '/cabinet/orders?payment=success&session_id={CHECKOUT_SESSION_ID}',
		});
		const cancelUrl = resolveSafeRedirectUrl(parsed.data.cancelUrl, {
			origin: appOrigin,
			fallbackPath: '/checkout?cancelled=1',
		});

		const metadata: Record<string, string> = {
			userId: session.user.id,
			items: JSON.stringify(items),
			locale,
		};
		if (resolvedCouponCode) metadata.couponCode = resolvedCouponCode;
		if (resolvedCouponAmount != null) metadata.couponAmount = resolvedCouponAmount.toFixed(2);
		if (shipmentMethod) metadata.shipmentMethod = shipmentMethod;
		if (shippingAddress) metadata.shippingAddress = shippingAddress;

		const checkoutSession = await stripe.checkout.sessions.create({
			mode: 'payment',
			payment_method_types: ['card'],
			locale: 'auto',
			line_items: lineItems,
			discounts: stripeCouponId ? [{ coupon: stripeCouponId }] : undefined,
			success_url: successUrl,
			cancel_url: cancelUrl,
			customer_email: session.user?.email ?? undefined,
			metadata,
		});

		return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url });
	} catch (error) {
		console.error('Stripe session failed', error);

		const status =
			typeof (error as any)?.statusCode === 'number'
				? (error as any).statusCode
				: 500;
		const errorCode =
			typeof (error as any)?.code === 'string'
				? (error as any).code
				: 'stripe_session_failed';

		const message =
			typeof (error as any)?.message === 'string'
				? (error as any).message
				: undefined;

		return NextResponse.json(
			env.NODE_ENV === 'development'
				? { error: errorCode, message }
				: { error: errorCode },
			{ status: status >= 400 && status < 600 ? status : 500 }
		);
	}
}
