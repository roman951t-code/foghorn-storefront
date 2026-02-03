'use server';

import 'server-only';

import { z } from 'zod';
import { getCouponDiscountPreview, type CouponDiscountPreview, type CouponValidationError } from '@/lib/coupons';

const PreviewCouponSchema = z.object({
	code: z.string().min(1),
	subtotal: z.number().finite().nonnegative(),
});

export type PreviewCouponResult =
	| { success: true; coupon: CouponDiscountPreview }
	| { success: false; error: CouponValidationError | 'invalid_payload' | 'unknown' };

export async function previewCoupon(
	_: unknown,
	payload: { code: string; subtotal: number }
): Promise<PreviewCouponResult> {
	const parsed = PreviewCouponSchema.safeParse(payload);
	if (!parsed.success) return { success: false, error: 'invalid_payload' };

	try {
		const res = await getCouponDiscountPreview(parsed.data.code, parsed.data.subtotal);
		if (!res.ok) return { success: false, error: res.error };
		return { success: true, coupon: res.preview };
	} catch {
		return { success: false, error: 'unknown' };
	}
}

