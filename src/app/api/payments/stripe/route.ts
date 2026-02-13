import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createHash } from 'node:crypto';
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
import { recordApi5xxEvent } from '@/lib/opsMonitoring';
import {
	getMissingRequiredShippingAddressFields,
	normalizeShippingAddress,
	SHIPPING_ADDRESS_FIELD_LIMITS,
} from '@/utils/shippingAddress';
import { asErrorDetails, resolveSafeRedirectUrl } from './route-utils';

type LineItemPayload = { productId: string; variantId: string | null; quantity: number };

const currency = STORE_CURRENCY_CODE_LOWER;
const STRIPE_COUPON_ID_PREFIX = 'appc_';

const toStripeCouponId = ({
	couponId,
	discountType,
	discountValue,
	currencyCode,
	revision,
}: {
	couponId: string;
	discountType: 'PERCENT' | 'FIXED';
	discountValue: number;
	currencyCode: string;
	revision: number;
}) => {
	const key = [
		couponId.trim(),
		discountType,
		discountValue.toFixed(2),
		currencyCode.toLowerCase(),
		String(revision),
	].join('|');
	const digest = createHash('sha256').update(key).digest('hex').slice(0, 24);
	return `${STRIPE_COUPON_ID_PREFIX}${digest}`;
};

const isStripeResourceMissing = (error: unknown) =>
	typeof error === 'object' &&
	error !== null &&
	((error as { statusCode?: unknown }).statusCode === 404 ||
		(error as { code?: unknown }).code === 'resource_missing');

const isStripeResourceAlreadyExists = (error: unknown) =>
	typeof error === 'object' &&
	error !== null &&
	((error as { code?: unknown }).code === 'resource_already_exists' ||
		(error as { code?: unknown }).code === 'id_already_exists');

const isDeletedStripeCoupon = (coupon: Stripe.Coupon | Stripe.DeletedCoupon): coupon is Stripe.DeletedCoupon =>
	'deleted' in coupon && coupon.deleted === true;

const buildReusableStripeCouponCreateParams = ({
	stripeCouponId,
	discountType,
	discountValue,
	name,
	couponCode,
	couponId,
	promotionId,
}: {
	stripeCouponId: string;
	discountType: 'PERCENT' | 'FIXED';
	discountValue: number;
	name: string;
	couponCode: string;
	couponId: string;
	promotionId: string;
}): Stripe.CouponCreateParams => {
	const metadata = {
		appCouponCode: couponCode,
		appCouponId: couponId,
		appPromotionId: promotionId,
	};

	if (discountType === 'PERCENT') {
		const percentOff = Math.max(0.01, Math.min(100, Math.round(discountValue * 100) / 100));
		return {
			id: stripeCouponId,
			duration: 'once',
			percent_off: percentOff,
			name,
			metadata,
		};
	}

	const amountOff = Math.max(1, Math.round(discountValue * 100));
	return {
		id: stripeCouponId,
		duration: 'once',
		amount_off: amountOff,
		currency,
		name,
		metadata,
	};
};

async function getOrCreateReusableStripeCouponId({
	preview,
}: {
	preview: {
		code: string;
		label: string;
		couponId: string;
		promotionId: string;
		discountType: 'PERCENT' | 'FIXED';
		discountValue: number;
	};
}) {
	for (let revision = 0; revision < 2; revision += 1) {
		const stripeCouponId = toStripeCouponId({
			couponId: preview.couponId,
			discountType: preview.discountType,
			discountValue: preview.discountValue,
			currencyCode: currency,
			revision,
		});

		try {
			const existing = await stripe!.coupons.retrieve(stripeCouponId);
			if (!isDeletedStripeCoupon(existing)) return existing.id;
		} catch (error) {
			if (!isStripeResourceMissing(error)) throw error;
		}

		try {
			const created = await stripe!.coupons.create(
				buildReusableStripeCouponCreateParams({
					stripeCouponId,
					discountType: preview.discountType,
					discountValue: preview.discountValue,
					name: (preview.label || preview.code).slice(0, 40),
					couponCode: preview.code,
					couponId: preview.couponId,
					promotionId: preview.promotionId,
				})
			);
			return created.id;
		} catch (error) {
			if (!isStripeResourceAlreadyExists(error)) throw error;
			const existing = await stripe!.coupons.retrieve(stripeCouponId);
			if (!isDeletedStripeCoupon(existing)) return existing.id;
		}
	}

	throw new Error('stripe_coupon_unavailable');
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
		shippingAddress: z
			.union([
				z.string().max(SHIPPING_ADDRESS_FIELD_LIMITS.fullAddress),
				z.object({
					country: z.string().max(SHIPPING_ADDRESS_FIELD_LIMITS.country).optional().nullable(),
					region: z.string().max(SHIPPING_ADDRESS_FIELD_LIMITS.region).optional().nullable(),
					city: z.string().max(SHIPPING_ADDRESS_FIELD_LIMITS.city).optional().nullable(),
					postalCode: z.string().max(SHIPPING_ADDRESS_FIELD_LIMITS.postalCode).optional().nullable(),
					addressLine1: z.string().max(SHIPPING_ADDRESS_FIELD_LIMITS.addressLine1).optional().nullable(),
					addressLine2: z.string().max(SHIPPING_ADDRESS_FIELD_LIMITS.addressLine2).optional().nullable(),
				}),
			])
			.optional(),
		locale: z.string().trim().toLowerCase().max(16).optional(),
		successUrl: z.string().url().optional(),
		cancelUrl: z.string().url().optional(),
	});

	try {
		if (!stripe) {
			recordApi5xxEvent({
				route: '/api/payments/stripe',
				statusCode: 500,
				error: 'stripe_not_configured',
			});
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
		const shippingAddress = normalizeShippingAddress(parsed.data.shippingAddress);
		const missingShippingFields = getMissingRequiredShippingAddressFields(parsed.data.shippingAddress);
		if (missingShippingFields.length > 0) {
			return NextResponse.json({ error: 'shipping-address-required' }, { status: 400 });
		}
		let resolvedCouponCode: string | null = null;
		let resolvedCouponAmount: number | null = null;
		let stripeCouponId: string | null = null;
		let resolvedCouponId: string | null = null;
		let resolvedPromotionId: string | null = null;
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

			stripeCouponId = await getOrCreateReusableStripeCouponId({
				preview: {
					code: previewRes.preview.code,
					label: previewRes.preview.label,
					couponId: previewRes.preview.couponId,
					promotionId: previewRes.preview.promotionId,
					discountType: previewRes.preview.discountType,
					discountValue: previewRes.preview.discountValue,
				},
			});

			resolvedCouponCode = previewRes.preview.code;
			resolvedCouponAmount = previewRes.preview.amount;
			resolvedCouponId = previewRes.preview.couponId;
			resolvedPromotionId = previewRes.preview.promotionId;
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
		if (resolvedCouponId) metadata.couponId = resolvedCouponId;
		if (resolvedPromotionId) metadata.promotionId = resolvedPromotionId;
		if (shipmentMethod) metadata.shipmentMethod = shipmentMethod;
		if (shippingAddress.fullAddress) metadata.shippingAddress = shippingAddress.fullAddress;
		if (shippingAddress.country) metadata.shippingCountry = shippingAddress.country;
		if (shippingAddress.region) metadata.shippingRegion = shippingAddress.region;
		if (shippingAddress.city) metadata.shippingCity = shippingAddress.city;
		if (shippingAddress.postalCode) metadata.shippingPostalCode = shippingAddress.postalCode;
		if (shippingAddress.addressLine1) metadata.shippingAddressLine1 = shippingAddress.addressLine1;
		if (shippingAddress.addressLine2) metadata.shippingAddressLine2 = shippingAddress.addressLine2;

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
			const errorDetails = asErrorDetails(error);

			const status = errorDetails.statusCode ?? 500;
			const errorCode = errorDetails.code ?? 'stripe_session_failed';
			const message = errorDetails.message;
			const finalStatus = status >= 400 && status < 600 ? status : 500;
			if (finalStatus >= 500) {
			recordApi5xxEvent({
				route: '/api/payments/stripe',
				statusCode: finalStatus,
				error: message ?? errorCode,
			});
		}

		return NextResponse.json(
			env.NODE_ENV === 'development'
				? { error: errorCode, message }
				: { error: errorCode },
			{ status: finalStatus }
		);
	}
}
