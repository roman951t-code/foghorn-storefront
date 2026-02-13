import 'server-only';

import type { DiscountType } from '@prisma/client';
import { prisma } from '@/lib/prisma';

type CouponWithPromotion = {
	id: string;
	code: string;
	isActive: boolean;
	maxRedemptions: number | null;
	redemptionCount: number;
	startsAt: Date | null;
	endsAt: Date | null;
	promotion: {
		id: string;
		name: string;
		isActive: boolean;
		discountType: DiscountType;
		discountValue: any;
		startsAt: Date | null;
		endsAt: Date | null;
		minOrderTotal: any | null;
	};
};

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

const toNumber = (value: unknown): number => {
	if (typeof value === 'number') return value;
	if (typeof value === 'bigint') return Number(value);
	if (typeof value === 'string') return Number(value);
	if (value && typeof value === 'object' && 'toNumber' in value && typeof (value as any).toNumber === 'function') {
		return (value as any).toNumber();
	}
	return Number(value);
};

export type CouponDiscountPreview = {
	code: string;
	label: string;
	amount: number;
	couponId: string;
	promotionId: string;
	discountType: DiscountType;
	discountValue: number;
};

export type CouponValidationError =
	| 'coupon_not_found'
	| 'coupon_inactive'
	| 'coupon_not_started'
	| 'coupon_expired'
	| 'coupon_maxed'
	| 'promotion_inactive'
	| 'promotion_not_started'
	| 'promotion_expired'
	| 'min_order_total'
	| 'discount_zero';

export async function getCouponDiscountPreview(
	codeRaw: string,
	subtotal: number
): Promise<{ ok: true; preview: CouponDiscountPreview; maxRedemptions: number | null } | { ok: false; error: CouponValidationError }> {
	const code = (codeRaw ?? '').trim();
	if (!code) return { ok: false, error: 'coupon_not_found' };

	const now = new Date();
	const coupon = (await prisma.coupon.findFirst({
		where: { code: { equals: code, mode: 'insensitive' } },
		select: {
			id: true,
			code: true,
			isActive: true,
			maxRedemptions: true,
			redemptionCount: true,
			startsAt: true,
			endsAt: true,
			promotion: {
				select: {
					id: true,
					name: true,
					isActive: true,
					discountType: true,
					discountValue: true,
					startsAt: true,
					endsAt: true,
					minOrderTotal: true,
				},
			},
		},
	})) as CouponWithPromotion | null;

	if (!coupon) return { ok: false, error: 'coupon_not_found' };
	if (!coupon.isActive) return { ok: false, error: 'coupon_inactive' };
	if (coupon.startsAt && coupon.startsAt.getTime() > now.getTime()) return { ok: false, error: 'coupon_not_started' };
	if (coupon.endsAt && coupon.endsAt.getTime() < now.getTime()) return { ok: false, error: 'coupon_expired' };
	if (coupon.maxRedemptions != null && coupon.redemptionCount >= coupon.maxRedemptions) return { ok: false, error: 'coupon_maxed' };

	const promo = coupon.promotion;
	if (!promo?.isActive) return { ok: false, error: 'promotion_inactive' };
	if (promo.startsAt && promo.startsAt.getTime() > now.getTime()) return { ok: false, error: 'promotion_not_started' };
	if (promo.endsAt && promo.endsAt.getTime() < now.getTime()) return { ok: false, error: 'promotion_expired' };

	const minOrderTotal = promo.minOrderTotal != null ? toNumber(promo.minOrderTotal) : null;
	if (minOrderTotal != null && subtotal < minOrderTotal) return { ok: false, error: 'min_order_total' };

	const discountValue = toNumber(promo.discountValue);
	const rawAmount =
		promo.discountType === 'PERCENT'
			? subtotal * Math.max(0, discountValue) / 100
			: Math.max(0, discountValue);
	const amount = roundCurrency(Math.max(0, Math.min(subtotal, rawAmount)));
	if (amount <= 0) return { ok: false, error: 'discount_zero' };

	return {
		ok: true,
		preview: {
			code: coupon.code,
			label: promo.name,
			amount,
			couponId: coupon.id,
			promotionId: promo.id,
			discountType: promo.discountType,
			discountValue,
		},
		maxRedemptions: coupon.maxRedemptions ?? null,
	};
}
