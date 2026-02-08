'use server';

import 'server-only';

import { Prisma } from '@prisma/client';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { revalidateTag, updateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { STORE_CURRENCY_CODE_LOWER } from '@/config/currency';
import { normalizeOrder } from '../orderUtils';
import { isProductPublished } from '@/utils/publishSchedule';
import { getEffectiveDiscountPrice } from '@/utils/discountSchedule';
import type { UserOrder } from '@/types/order';
import { sendOrderConfirmationEmail } from '@/lib/orderEmails';
import { PRODUCT_LIST_CACHE_TAG, productCacheTagById } from '@/constants/products';
import { getCouponDiscountPreview } from '@/lib/coupons';

type Result =
	| { success: true; order?: UserOrder }
	| { success: false; message: string };

type OrderItemPayload = { productId: string; variantId: string | null; quantity: number };
const MAX_ITEM_QUANTITY = 99;

type FinalizeMode = 'user' | 'system';

type UserSnapshot = {
	id: string;
	email: string | null;
	name: string | null;
	lastName: string | null;
	middleName: string | null;
	phoneNumber: string | null;
};

const stripeOrderInclude = {
	discounts: true,
	items: {
		include: {
			product: { select: { id: true, name: true, fullSlug: true, imageUrl: true } },
			variant: {
				select: {
					id: true,
					sku: true,
					attributes: {
						select: {
							attribute: { select: { name: true, unit: true } },
							value: true,
						},
						orderBy: { attribute: { name: 'asc' } },
					},
				},
			},
		},
	},
} satisfies Prisma.OrderInclude;

const normalizeMetadataString = (value: unknown, maxLen: number) => {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	if (!trimmed) return null;
	if (trimmed.length > maxLen) return trimmed.slice(0, maxLen);
	return trimmed;
};

async function finalizeStripeOrderInternal(
	sessionId: string,
	{
		mode,
		requestUserId,
		requestHeaders,
		userSnapshotOverride,
	}: {
		mode: FinalizeMode;
		requestUserId?: string | null;
		requestHeaders?: Headers;
		userSnapshotOverride?: UserSnapshot | null;
	}
): Promise<Result> {
	if (!stripe) return { success: false, message: 'stripe_not_configured' };

	const existing = await prisma.order.findUnique({
		where: { stripeSessionId: sessionId },
		include: stripeOrderInclude,
	});

	if (existing) {
		if (existing.status === 'PENDING') {
			const existingSession = await stripe.checkout.sessions.retrieve(sessionId);
			if (existingSession.payment_status === 'paid') {
				const updated = await prisma.$transaction(async (tx) => {
					const order = await tx.order.update({
						where: { id: existing.id },
						data: { status: 'PAID' },
						include: stripeOrderInclude,
					});
					await tx.orderAuditEntry.create({
						data: {
							orderId: existing.id,
							type: 'STATUS_CHANGE',
							fromStatus: 'PENDING',
							toStatus: 'PAID',
							note: 'Auto-marked paid from Stripe session',
							adminEmail: null,
						},
					});
					return order;
				});
				const normalized = await normalizeOrder(updated);
				return { success: true, order: normalized };
			}
		}

		const normalized = await normalizeOrder(existing);
		return { success: true, order: normalized };
	}

	const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
		expand: ['line_items'],
	});

	if (checkoutSession.payment_status !== 'paid') {
		return { success: false, message: 'not_paid' };
	}

	const sessionCurrency = checkoutSession.currency?.toLowerCase() ?? null;
	const expectedCurrency = STORE_CURRENCY_CODE_LOWER;
	if (sessionCurrency && sessionCurrency !== expectedCurrency) {
		return { success: false, message: 'currency_mismatch' };
	}

	const metadataUserId = normalizeMetadataString(checkoutSession.metadata?.userId, 128);
	if (mode === 'user') {
		if (!requestUserId) return { success: false, message: 'unauthorized' };
		if (metadataUserId && metadataUserId !== requestUserId) return { success: false, message: 'forbidden' };
	} else {
		if (!metadataUserId) return { success: false, message: 'missing_userId' };
	}

	const userId = mode === 'user' ? (requestUserId ?? null) : metadataUserId;
	if (!userId) return { success: false, message: 'unauthorized' };

	const userSnapshot: UserSnapshot | null =
		userSnapshotOverride ??
		(await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				name: true,
				lastName: true,
				middleName: true,
				phoneNumber: true,
			},
		}));

	if (!userSnapshot?.id) return { success: false, message: 'user_not_found' };

	const shipmentMethod = normalizeMetadataString(checkoutSession.metadata?.shipmentMethod, 64);
	const shippingAddress = normalizeMetadataString(checkoutSession.metadata?.shippingAddress, 500);

	let itemsPayload: OrderItemPayload[] = [];
	try {
		const parsed = JSON.parse(checkoutSession.metadata?.items ?? '[]');
		if (Array.isArray(parsed)) {
			itemsPayload = parsed
				.map((item) => ({
					productId: String(item?.productId ?? '').trim(),
					variantId: item?.variantId ? String(item?.variantId).trim() : null,
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
			discountStartAt: true,
			discountEndAt: true,
			stock: true,
			inStock: true,
			status: true,
			publishStartAt: true,
			publishEndAt: true,
		},
	});

	const productMap = new Map(products.map((p) => [p.id, p]));

	const uniqueVariantIds = Array.from(
		new Set(itemsPayload.map((i) => i.variantId).filter((v): v is string => !!v))
	);
	const variants = uniqueVariantIds.length
		? await prisma.productVariant.findMany({
				where: { id: { in: uniqueVariantIds } },
				select: { id: true, productId: true, sku: true, price: true, stock: true },
			})
		: [];
	const variantById = new Map(variants.map((v) => [v.id, v]));

	const productsNeedingDefaultVariant = itemsPayload
		.filter((i) => !i.variantId)
		.map((i) => i.productId);
	const defaultVariants = productsNeedingDefaultVariant.length
		? await prisma.productVariant.findMany({
				where: { productId: { in: productsNeedingDefaultVariant }, stock: { gt: 0 } },
				select: { id: true, productId: true, sku: true, price: true, stock: true },
				orderBy: [{ productId: 'asc' }, { price: 'asc' }, { createdAt: 'asc' }],
			})
		: [];
	const defaultVariantByProduct = new Map<string, (typeof defaultVariants)[number]>();
	for (const v of defaultVariants) {
		if (!defaultVariantByProduct.has(v.productId)) defaultVariantByProduct.set(v.productId, v);
	}

	const toCurrency = (value: number) => Math.round(value * 100) / 100;
	const unavailable: string[] = [];
	const orderItems = itemsPayload
		.map((item) => {
			const product = productMap.get(item.productId);
			if (
				!product ||
				!product.inStock ||
				!isProductPublished(product.status, product.publishStartAt, product.publishEndAt)
			) {
				unavailable.push(item.productId);
				return null;
			}

			const variant =
				(item.variantId ? variantById.get(item.variantId) ?? null : null) ??
				(defaultVariantByProduct.get(item.productId) ?? null);
			if (!variant || variant.productId !== item.productId) {
				unavailable.push(item.productId);
				return null;
			}

			const requestedQty = Math.max(1, Math.min(MAX_ITEM_QUANTITY, item.quantity));
			const availableStock = Math.max(0, variant.stock ?? 0);
			if (!availableStock || requestedQty > availableStock) {
				unavailable.push(item.productId);
				return null;
			}

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
			const effectiveVariantPrice =
				discountAmount > 0 ? Math.max(0, variantBase - discountAmount) : variantBase;

			const baseUnitPrice = toCurrency(Number(variantBase));
			const unitPrice = toCurrency(Number(effectiveVariantPrice));
			const price = toCurrency(unitPrice * requestedQty);
			return {
				productId: item.productId,
				variantId: variant.id,
				quantity: requestedQty,
				baseUnitPrice,
				unitPrice,
				price,
			};
		})
		.filter(Boolean) as {
		productId: string;
		variantId: string;
		quantity: number;
		baseUnitPrice: number;
		unitPrice: number;
		price: number;
	}[];

	if (!orderItems.length) {
		return { success: false, message: 'invalid_items' };
	}

	if (unavailable.length) {
		return { success: false, message: 'invalid_items' };
	}

	const calculatedTotal = toCurrency(orderItems.reduce((acc, item) => acc + item.price, 0));
	const amountSubtotal = checkoutSession.amount_subtotal ? checkoutSession.amount_subtotal / 100 : null;
	const amountDiscount = checkoutSession.total_details?.amount_discount
		? checkoutSession.total_details.amount_discount / 100
		: 0;
	const amountTotal = checkoutSession.amount_total ? checkoutSession.amount_total / 100 : null;

	if (amountSubtotal === null || Math.abs(calculatedTotal - amountSubtotal) > 0.01) {
		return { success: false, message: 'invalid_subtotal' };
	}

	const expectedTotal = toCurrency(Math.max(0, calculatedTotal - amountDiscount));
	if (amountTotal === null || Math.abs(expectedTotal - amountTotal) > 0.01) {
		return { success: false, message: 'invalid_total' };
	}

	const decimalTotal = new Prisma.Decimal(amountTotal.toFixed(2));

	const couponCode = typeof checkoutSession.metadata?.couponCode === 'string'
		? checkoutSession.metadata.couponCode.trim()
		: '';
	const couponPreview =
		couponCode && amountDiscount > 0 ? await getCouponDiscountPreview(couponCode, calculatedTotal).catch(() => null) : null;

	const buildCustomerName = (first: string | null | undefined, last: string | null | undefined) => {
		const firstTrimmed = (first ?? '').trim();
		const lastTrimmed = (last ?? '').trim();
		if (!firstTrimmed && !lastTrimmed) return null;
		if (!lastTrimmed) return firstTrimmed || null;
		if (!firstTrimmed) return lastTrimmed || null;
		if (firstTrimmed.toLocaleLowerCase().includes(lastTrimmed.toLocaleLowerCase())) {
			return firstTrimmed;
		}
		return `${firstTrimmed} ${lastTrimmed}`;
	};
	const contactName = userSnapshot.name ?? null;
	const contactLastName = userSnapshot.lastName ?? null;
	const customerName = buildCustomerName(contactName, contactLastName);

	let order:
		| Awaited<ReturnType<(typeof prisma)['order']['create']>>
		| undefined;
	try {
		order = await prisma.$transaction(async (tx) => {
			for (const item of orderItems) {
				const updateResult = await tx.productVariant.updateMany({
					where: { id: item.variantId, productId: item.productId, stock: { gte: item.quantity } },
					data: { stock: { decrement: item.quantity } },
				});

				if (updateResult.count === 0) {
					throw new Error('stock-conflict');
				}
			}

			for (const productId of uniqueIds) {
				const remaining = await tx.productVariant.findMany({
					where: { productId, stock: { gt: 0 } },
					select: { stock: true },
				});
				const totalStock = remaining.reduce((sum, v) => sum + (v.stock ?? 0), 0);
				await tx.product.update({
					where: { id: productId },
					data: { stock: totalStock, inStock: totalStock > 0 },
				});
			}

			const created = await tx.order.create({
				data: {
					userId: userSnapshot.id,
					total: decimalTotal,
					paymentMethod: 'card',
					shipmentMethod,
					shippingAddress,
					status: 'PAID',
					stripeSessionId: sessionId,
					customerName,
					contactName,
					contactLastName,
					contactMiddleName: userSnapshot.middleName ?? null,
					contactEmail: userSnapshot.email ?? null,
					contactPhone: userSnapshot.phoneNumber ?? null,
					items: {
						create: orderItems.map((item) => ({
							productId: item.productId,
							variantId: item.variantId,
							quantity: item.quantity,
							baseUnitPrice: new Prisma.Decimal(item.baseUnitPrice.toFixed(2)),
							unitPrice: new Prisma.Decimal(item.unitPrice.toFixed(2)),
							price: new Prisma.Decimal(item.price.toFixed(2)),
						})),
					},
				},
				include: {
					items: stripeOrderInclude.items,
					discounts: true,
				},
			});

			// Clear cart for the user after successful paid order
			await tx.cartItem.deleteMany({ where: { cart: { userId: userSnapshot.id } } });

			if (couponCode && amountDiscount > 0) {
				let couponId: string | null = null;
				let promotionId: string | null = null;
				let label: string | null = null;
				let code: string | null = couponCode;

				if (couponPreview && couponPreview.ok) {
					couponId = couponPreview.preview.couponId;
					promotionId = couponPreview.preview.promotionId;
					label = couponPreview.preview.label;
					code = couponPreview.preview.code;
					await tx.coupon.update({
						where: { id: couponId },
						data: { redemptionCount: { increment: 1 } },
					});
				} else {
					const existingCoupon = await tx.coupon.findFirst({
						where: { code: { equals: couponCode, mode: 'insensitive' } },
						select: { id: true, code: true, promotion: { select: { id: true, name: true } } },
					});
					if (existingCoupon) {
						couponId = existingCoupon.id;
						promotionId = existingCoupon.promotion?.id ?? null;
						label = existingCoupon.promotion?.name ?? null;
						code = existingCoupon.code;
						await tx.coupon.update({
							where: { id: couponId },
							data: { redemptionCount: { increment: 1 } },
						});
					}
				}

				await tx.orderDiscount.create({
					data: {
						orderId: created.id,
						couponId,
						promotionId,
						label,
						code,
						amount: new Prisma.Decimal(amountDiscount.toFixed(2)),
					},
				});
			}

			return created;
		});
	} catch (error) {
		return { success: false, message: 'order-create-failed' };
	}

	if (!order) {
		return { success: false, message: 'order-create-failed' };
	}

	const normalized = await normalizeOrder(order);
	const productTags = uniqueIds.map((id) => productCacheTagById(id));
	await Promise.all(productTags.map((tag) => updateTag(tag)));
	await revalidateTag(PRODUCT_LIST_CACHE_TAG, 'default');

	await sendOrderConfirmationEmail({
		order: normalized,
		email: userSnapshot.email ?? null,
		name: userSnapshot.name ?? null,
		headersList: requestHeaders,
	});

	return { success: true, order: normalized };
}

export async function finalizeStripeOrder(sessionId?: string | null): Promise<Result> {
	if (!sessionId) return { success: false, message: 'missing_session' };

	const requestHeaders = await headers();
	const session = await auth.api.getSession({ headers: requestHeaders });
	const userId = session?.user?.id;

	if (!userId) return { success: false, message: 'unauthorized' };

	return finalizeStripeOrderInternal(sessionId, {
		mode: 'user',
		requestUserId: userId,
		requestHeaders,
		userSnapshotOverride: {
			id: userId,
			email: session.user?.email ?? null,
			name: session.user?.name ?? null,
			lastName: (session.user as any)?.lastName ?? null,
			middleName: (session.user as any)?.middleName ?? null,
			phoneNumber: (session.user as any)?.phoneNumber ?? null,
		},
	});
}

export async function finalizeStripeOrderAsSystem(sessionId: string): Promise<Result> {
	if (!sessionId) return { success: false, message: 'missing_session' };
	return finalizeStripeOrderInternal(sessionId, { mode: 'system' });
}
