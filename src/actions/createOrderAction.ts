'use server';

import 'server-only';

import { Prisma } from '@prisma/client';
import { headers } from 'next/headers';
import { z } from 'zod';
import { revalidateTag, updateTag } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getEffectiveDiscountPrice } from '@/utils/discountSchedule';
import { isProductPublished } from '@/utils/publishSchedule';
import { normalizeOrder } from './orderUtils';
import type { UserOrder } from '@/types/order';
import { sendOrderConfirmationEmail } from '@/lib/orderEmails';
import { PRODUCT_LIST_CACHE_TAG, productCacheTagById } from '@/constants/products';
import { getCouponDiscountPreview } from '@/lib/coupons';

type CreateOrderItemPayload = { productId: string; variantId: string | null; quantity: number };

export type CreateOrderPayload = {
	items: CreateOrderItemPayload[];
	paymentMethod?: string;
	shipmentMethod?: string;
	couponCode?: string;
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
				quantity: z.number().int().positive().max(99, 'quantity_too_high'),
			})
		)
		.min(1, 'items_required'),
	paymentMethod: z.string().optional(),
	shipmentMethod: z.string().optional(),
	couponCode: z.string().optional(),
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

	const items = parsed.data.items.map((item) => ({
		productId: item.productId.trim(),
		variantId: item.variantId ? item.variantId.trim() : null,
		quantity: Math.max(1, Math.floor(item.quantity)),
	}));

	const uniqueIds = Array.from(new Set(items.map((i) => i.productId)));
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

	if (products.length !== uniqueIds.length) {
		return { success: false, message: 'invalid-items' };
	}

	const productMap = new Map(products.map((p) => [p.id, p]));
	const unavailable: string[] = [];

	const toCurrency = (value: number) => Math.round(value * 100) / 100;

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
				select: { id: true, productId: true, price: true, stock: true, sku: true },
				orderBy: [{ productId: 'asc' }, { price: 'asc' }, { createdAt: 'asc' }],
			})
		: [];
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

			const variant =
				(item.variantId ? variantById.get(item.variantId) ?? null : null) ??
				(defaultVariantByProduct.get(item.productId) ?? null);
			if (!variant || variant.productId !== item.productId) {
				unavailable.push(item.productId);
				return null;
			}

			const availableStock = Math.max(0, variant.stock ?? 0);
			if (item.quantity > availableStock) {
				unavailable.push(item.productId);
				return null;
			}

			const basePrice = Number(product.basePrice ?? 0);
			const scheduledDiscountPrice = getEffectiveDiscountPrice(
				basePrice,
				product.discountPrice != null ? Number(product.discountPrice) : null,
				product.discountStartAt ?? null,
				product.discountEndAt ?? null
			);
			const discountAmount =
				scheduledDiscountPrice != null ? Math.max(0, basePrice - scheduledDiscountPrice) : 0;

			const variantBasePrice = variant.price?.toNumber?.() ?? 0;
			const effectiveVariantPrice =
				discountAmount > 0 ? Math.max(0, variantBasePrice - discountAmount) : variantBasePrice;

			const baseUnitPrice = toCurrency(Number(variantBasePrice));
			const unitPrice = toCurrency(Number(effectiveVariantPrice));
			const quantity = Math.max(1, item.quantity);
			const price = toCurrency(unitPrice * quantity);
			return {
				productId: item.productId,
				variantId: variant.id,
				quantity,
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

	if (unavailable.length || !orderItems.length) {
		return { success: false, message: 'out-of-stock' };
	}

	const total = orderItems.reduce((acc, item) => acc + item.price, 0);
	const roundedTotal = Math.round(total * 100) / 100;
	const couponCode = parsed.data.couponCode?.trim() || null;
	const couponDiscountRes =
		couponCode ? await getCouponDiscountPreview(couponCode, roundedTotal) : null;
	if (couponCode && couponDiscountRes && !couponDiscountRes.ok) {
		return { success: false, message: couponDiscountRes.error };
	}
	const couponDiscountAmount =
		couponDiscountRes && couponDiscountRes.ok ? couponDiscountRes.preview.amount : 0;
	const finalTotal = Math.round(Math.max(0, roundedTotal - couponDiscountAmount) * 100) / 100;

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

			// Keep Product.inStock roughly in sync with variant inventory.
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

			const newOrder = await tx.order.create({
				data: {
					userId,
					total: new Prisma.Decimal(finalTotal.toFixed(2)),
					paymentMethod: parsed.data.paymentMethod ?? null,
					shipmentMethod: parsed.data.shipmentMethod ?? null,
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

			if (couponDiscountRes && couponDiscountRes.ok) {
				const maxRedemptions = couponDiscountRes.maxRedemptions;
				const updated = await tx.coupon.updateMany({
					where:
						maxRedemptions != null
							? { id: couponDiscountRes.preview.couponId, redemptionCount: { lt: maxRedemptions } }
							: { id: couponDiscountRes.preview.couponId },
					data: { redemptionCount: { increment: 1 } },
				});
				if (updated.count === 0) {
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

			return newOrder;
		});

		const normalized = await normalizeOrder(order);

		const productTags = uniqueIds.map((id) => productCacheTagById(id));
		await Promise.all(productTags.map((tag) => updateTag(tag)));
		await revalidateTag(PRODUCT_LIST_CACHE_TAG, 'default');

		await sendOrderConfirmationEmail({
			order: normalized,
			email: session.user?.email ?? null,
			name: session.user?.name ?? null,
			headersList: requestHeaders,
		});

		return { success: true, order: normalized };
	} catch (error) {
		const message =
			error instanceof Error && error.message === 'coupon-maxed'
				? 'coupon_maxed'
				: 'order-create-failed';
		return { success: false, message };
	}
}
