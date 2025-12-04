import { CartProduct } from '@/types/cart';

export type CartTotals = {
	totalCount: number;
	baseTotal: number;
	discountedTotal: number;
	discountTotal: number;
};

export function calculateCartTotals(items: CartProduct[]): CartTotals {
	const totals = items.reduce(
		(acc, item) => {
			const quantity = Math.max(1, item.quantity ?? 1);
			const effectivePrice = item.discountPrice ?? item.basePrice;

			acc.totalCount += quantity;
			acc.baseTotal += item.basePrice * quantity;
			acc.discountedTotal += effectivePrice * quantity;

			return acc;
		},
		{ totalCount: 0, baseTotal: 0, discountedTotal: 0, discountTotal: 0 }
	);

	totals.discountTotal = totals.baseTotal - totals.discountedTotal;

	return totals;
}
