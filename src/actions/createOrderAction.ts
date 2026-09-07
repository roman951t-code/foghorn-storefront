'use server';

import 'server-only';

import { Prisma } from '@prisma/client';
import * as Sentry from '@sentry/nextjs';
import { headers } from 'next/headers';
import { z } from 'zod';
import { revalidateTag, updateTag } from 'next/cache';
import { DEFAULT_LOCALE } from '@/constants/locales';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getEffectiveVariantDiscountPrice } from '@/utils/discountSchedule';
import { computeProductEffectivePrice } from '@/utils/productEffectivePrice';
import { getLocaleFallbacks, pickLocalizedTranslation } from '@/utils/localeFallback';
import { isProductPublished } from '@/utils/publishSchedule';
import { buildLocalizedVariantLabel } from '@/utils/attributeLocalization';
import { normalizeOrder } from './orderUtils';
import type { UserOrder } from '@/types/order';
import { sendOrderConfirmationEmail } from '@/lib/orderEmails';
import { PRODUCT_LIST_CACHE_TAG, productCacheTagById } from '@/constants/products';
import { getCouponDiscountPreview, incrementCouponRedemptionWithGuard } from '@/lib/coupons';
import {
	getMissingRequiredShippingAddressFields,
	normalizeShippingAddress,
	SHIPPING_ADDRESS_FIELD_LIMITS,
	type ShippingAddressInput,
} from '@/utils/shippingAddress';
import { roundPrice } from '@/utils/priceFormatting';
import { buildCustomerName } from '@/utils/customerName';
import { MAX_ITEM_QUANTITY } from '@/constants/cart';

type CreateOrderItemPayload = { productId: string; variantId: string | null; quantity: number };

type CreateOrderPayload = {
	items: CreateOrderItemPayload[];
	paymentMethod?: string;
	shipmentMethod?: string;
	shippingAddress?: ShippingAddressInput | string;
	couponCode?: string;
	locale?: string;
};

type CreateOrderResult =
	| { success: true; order: UserOrder }
	| { success: false; message?: string };

const CreateOrderSchema = z.object({
	items: z
		.array(
			z.object({
				productId: z.string().min(1, 'productId_required'),
				variantId: z.string().nullable(),
				quantity: z.number().int().positive().max(MAX_ITEM_QUANTITY, 'quantity_too_high'),
			})
		)
		.min(1, 'items_required'),
	paymentMethod: z.string().optional(),
	shipmentMethod: z.string().optional(),
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
	couponCode: z.string().optional(),
	locale: z.string().trim().toLowerCase().max(16).optional(),
});

export async function createOrderAction(
	_: unknown,
	payload: CreateOrderPayload
): Promise<CreateOrderResult> {
	const parsed = CreateOrderSchema.safeParse(payload);
	if (!parsed.success) {
		return { success: false, message: 'invalid-payload' };
	}

	const requestHeaders = await headers();
	const session = await auth.api.getSession({ headers: requestHeaders });
	const userId = session?.user?.id;

	if (!userId) {
		return { success: false, message: 'unauthorized' };
	}
	const locale = parsed.data.locale || DEFAULT_LOCALE;
	const localeFallbacks = getLocaleFallbacks(locale);

	const items = parsed.data.items.map((item) => ({
		productId: item.productId.trim(),
		variantId: item.variantId ? item.variantId.trim() : null,
		quantity: Math.max(1, Math.floor(item.quantity)),
	}));

	const uniqueIds = Array.from(new Set(items.map((i) => i.productId)));
	const uniqueVariantIds = Array.from(
		new Set(items.map((i) => i.variantId).filter((v): v is string => !!v))
	);
	const productsNeedingDefaultVariant = items
		.filter((i) => !i.variantId)
		.map((i) => i.productId);

	// These three lookups are independent of each other (all derived from
	// `items`, not from one another's results) — running them concurrently
	// instead of sequentially cuts this to one round-trip's worth of latency.
	const [products, variants, defaultVariants] = await Promise.all([
		prisma.product.findMany({
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
				translations: {
					where: { locale: { in: localeFallbacks } },
					select: { locale: true, name: true },
					orderBy: { updatedAt: 'desc' },
				},
			},
		}),
		uniqueVariantIds.length
			? prisma.productVariant.findMany({
					where: { id: { in: uniqueVariantIds } },
					select: {
						id: true,
						productId: true,
						sku: true,
						price: true,
						discountPrice: true,
						discountStartAt: true,
						discountEndAt: true,
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
			: Promise.resolve([]),
		productsNeedingDefaultVariant.length
			? prisma.productVariant.findMany({
					where: { productId: { in: productsNeedingDefaultVariant }, stock: { gt: 0 } },
					select: {
						id: true,
						productId: true,
						price: true,
						discountPrice: true,
						discountStartAt: true,
						discountEndAt: true,
						stock: true,
						sku: true,
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
			: Promise.resolve([]),
	]);

	if (products.length !== uniqueIds.length) {
		return { success: false, message: 'invalid-items' };
	}

	const productMap = new Map(products.map((p) => [p.id, p]));
	const unavailable: string[] = [];
	const variantById = new Map(variants.map((v) => [v.id, v]));
	const defaultVariantByProduct = new Map<string, (typeof defaultVariants)[number]>();
	for (const v of defaultVariants) {
		if (!defaultVariantByProduct.has(v.productId)) defaultVariantByProduct.set(v.productId, v);
	}

	const orderItems = items
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

			// A requested-but-missing variantId still falls through to the
			// product's default variant, same as no variantId at all.
			const variant =
				(item.variantId ? variantById.get(item.variantId) : undefined) ??
				defaultVariantByProduct.get(item.productId) ??
				null;
			if (!variant || variant.productId !== item.productId) {
				unavailable.push(item.productId);
				return null;
			}

			const availableStock = Math.max(0, variant.stock ?? 0);
			if (item.quantity > availableStock) {
				unavailable.push(item.productId);
				return null;
			}

			const variantBasePrice = variant.price?.toNumber?.() ?? 0;
			const effectiveVariantPrice =
				getEffectiveVariantDiscountPrice({
					variantBasePrice,
					variantDiscountPrice: variant.discountPrice?.toNumber?.() ?? null,
					variantDiscountStartAt: variant.discountStartAt ?? null,
					variantDiscountEndAt: variant.discountEndAt ?? null,
					productBasePrice: Number(product.basePrice ?? 0),
					productDiscountPrice: product.discountPrice != null ? Number(product.discountPrice) : null,
					productDiscountStartAt: product.discountStartAt ?? null,
					productDiscountEndAt: product.discountEndAt ?? null,
				}) ?? variantBasePrice;

			const baseUnitPrice = roundPrice(Number(variantBasePrice));
			const unitPrice = roundPrice(Number(effectiveVariantPrice));
			const quantity = Math.max(1, item.quantity);
			const price = roundPrice(unitPrice * quantity);
			const translation = pickLocalizedTranslation(product.translations, locale);
			return {
				productId: item.productId,
				variantId: variant.id,
				quantity,
				baseUnitPrice,
				unitPrice,
				price,
				snapshotLocale: locale,
				snapshotProductName: translation?.name ?? product.name,
				snapshotVariantLabel: buildLocalizedVariantLabel(
					variant.attributes.map((a) => ({ name: a.attribute.name, value: a.value, unit: a.attribute.unit })),
					locale
				),
				snapshotVariantSku: variant.sku ?? null,
			};
		})
		.filter(Boolean) as {
		productId: string;
		variantId: string;
		quantity: number;
		baseUnitPrice: number;
		unitPrice: number;
		price: number;
		snapshotLocale: string;
		snapshotProductName: string;
		snapshotVariantLabel: string | null;
		snapshotVariantSku: string | null;
	}[];

	if (unavailable.length || !orderItems.length) {
		return { success: false, message: 'out-of-stock' };
	}

	const total = orderItems.reduce((acc, item) => acc + item.price, 0);
	const roundedTotal = roundPrice(total);
	const couponCode = parsed.data.couponCode?.trim() || null;
	const shippingAddress = normalizeShippingAddress(parsed.data.shippingAddress);
	const couponDiscountRes =
		couponCode ? await getCouponDiscountPreview(couponCode, roundedTotal) : null;
	if (couponCode && couponDiscountRes && !couponDiscountRes.ok) {
		return { success: false, message: couponDiscountRes.error };
	}
	const couponDiscountAmount =
		couponDiscountRes && couponDiscountRes.ok ? couponDiscountRes.preview.amount : 0;
	const finalTotal = roundPrice(Math.max(0, roundedTotal - couponDiscountAmount));
	const missingShippingFields = getMissingRequiredShippingAddressFields(parsed.data.shippingAddress);
	if (missingShippingFields.length > 0) {
		return { success: false, message: 'shipping-address-required' };
	}

	const contactName = session.user?.name ?? null;
	const contactLastName = session.user?.lastName ?? null;
	const customerName = buildCustomerName(contactName, contactLastName);

	try {
		const order = await prisma.$transaction(async (tx) => {
			for (const item of orderItems) {
				const updateResult = await tx.productVariant.updateMany({
					where: { id: item.variantId, productId: item.productId, stock: { gte: item.quantity } },
					data: { stock: { decrement: item.quantity } },
				});

				if (updateResult.count === 0) {
					throw new Error('stock-conflict');
				}
			}

			// Keep Product.inStock roughly in sync with variant inventory, and
			// recompute sortPrice alongside it — a variant selling out here can
			// change which variant is "cheapest in-stock", which changes what
			// the product should sort by (see src/utils/productEffectivePrice.ts).
			const stockRecomputeNow = new Date();
			for (const productId of uniqueIds) {
				const remaining = await tx.productVariant.findMany({
					where: { productId, stock: { gt: 0 } },
					orderBy: [{ price: 'asc' }, { createdAt: 'asc' }],
					select: {
						stock: true,
						price: true,
						discountPrice: true,
						discountStartAt: true,
						discountEndAt: true,
					},
				});
				const totalStock = remaining.reduce((sum, v) => sum + (v.stock ?? 0), 0);
				const product = productMap.get(productId);
				const sortPrice = product
					? computeProductEffectivePrice({
							basePrice: product.basePrice,
							discountPrice: product.discountPrice,
							discountStartAt: product.discountStartAt,
							discountEndAt: product.discountEndAt,
							defaultVariant: remaining[0] ?? null,
							now: stockRecomputeNow,
						})
					: null;
				await tx.product.update({
					where: { id: productId },
					data: {
						stock: totalStock,
						inStock: totalStock > 0,
						...(sortPrice != null ? { sortPrice: new Prisma.Decimal(sortPrice.toFixed(2)) } : {}),
					},
				});
			}

			const newOrder = await tx.order.create({
				data: {
					userId,
					total: new Prisma.Decimal(finalTotal.toFixed(2)),
					paymentMethod: parsed.data.paymentMethod ?? null,
					shipmentMethod: parsed.data.shipmentMethod ?? null,
					shippingAddress: shippingAddress.fullAddress,
					shippingCountry: shippingAddress.country,
					shippingRegion: shippingAddress.region,
					shippingCity: shippingAddress.city,
					shippingPostalCode: shippingAddress.postalCode,
					shippingAddressLine1: shippingAddress.addressLine1,
					shippingAddressLine2: shippingAddress.addressLine2,
					customerName,
					contactName,
					contactLastName,
					contactMiddleName: session.user?.middleName ?? null,
					contactEmail: session.user?.email ?? null,
					contactPhone: session.user?.phoneNumber ?? null,
					items: {
						create: orderItems.map((item) => ({
							productId: item.productId,
							variantId: item.variantId,
							quantity: item.quantity,
							baseUnitPrice: new Prisma.Decimal(item.baseUnitPrice.toFixed(2)),
							unitPrice: new Prisma.Decimal(item.unitPrice.toFixed(2)),
							price: new Prisma.Decimal(item.price.toFixed(2)),
							snapshotLocale: item.snapshotLocale,
							snapshotProductName: item.snapshotProductName,
							snapshotVariantLabel: item.snapshotVariantLabel,
							snapshotVariantSku: item.snapshotVariantSku,
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
				},
			});

			await tx.user.update({
				where: { id: userId },
				data: {
					shippingCountry: shippingAddress.country,
					shippingRegion: shippingAddress.region,
					shippingCity: shippingAddress.city,
					shippingPostalCode: shippingAddress.postalCode,
					shippingAddressLine1: shippingAddress.addressLine1,
					shippingAddressLine2: shippingAddress.addressLine2,
				},
			});

			if (couponDiscountRes && couponDiscountRes.ok) {
				const didIncrement = await incrementCouponRedemptionWithGuard(tx, {
					couponId: couponDiscountRes.preview.couponId,
					maxRedemptions: couponDiscountRes.maxRedemptions,
				});
				if (!didIncrement) {
					throw new Error('coupon-maxed');
				}

				await tx.orderDiscount.create({
					data: {
						orderId: newOrder.id,
						couponId: couponDiscountRes.preview.couponId,
						promotionId: couponDiscountRes.preview.promotionId,
						label: couponDiscountRes.preview.label,
						code: couponDiscountRes.preview.code,
						amount: new Prisma.Decimal(couponDiscountRes.preview.amount.toFixed(2)),
					},
				});
			}

			// Clear cart after successful order creation.
			await tx.cartItem.deleteMany({
				where: { cart: { userId } },
			});

			return newOrder;
		});

		const normalized = await normalizeOrder(order, locale);

		// The order is committed at this point (stock decremented, cart cleared,
		// order row created). Cache revalidation and the confirmation email are
		// best-effort side effects — a failure here must never turn an already-
		// successful order into a reported failure (the customer would see
		// "order failed" and could retry, creating a duplicate order against
		// stock that's already been decremented).
		// The two are independent side effects, so run them concurrently rather
		// than paying for the Resend API round-trip after cache revalidation too.
		const [cacheResult, emailResult] = await Promise.allSettled([
			(async () => {
				const productTags = uniqueIds.map((id) => productCacheTagById(id));
				await Promise.all(productTags.map((tag) => updateTag(tag)));
				await revalidateTag(PRODUCT_LIST_CACHE_TAG, 'default');
			})(),
			sendOrderConfirmationEmail({
				order: normalized,
				email: session.user?.email ?? null,
				name: session.user?.name ?? null,
				locale,
			}),
		]);
		if (cacheResult.status === 'rejected') {
			Sentry.captureException(cacheResult.reason, { tags: { orderStep: 'cache-revalidate' } });
		}
		if (emailResult.status === 'rejected') {
			Sentry.captureException(emailResult.reason, { tags: { orderStep: 'confirmation-email' } });
		}

		return { success: true, order: normalized };
	} catch (error) {
		const message =
			error instanceof Error && error.message === 'coupon-maxed'
				? 'coupon_maxed'
				: 'order-create-failed';
		Sentry.captureException(error, { tags: { orderStep: 'transaction' } });
		return { success: false, message };
	}
}
