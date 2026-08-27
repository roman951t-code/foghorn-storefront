import type { Prisma } from '@prisma/client';
import { getEffectiveDiscountPrice, getEffectiveVariantDiscountPrice } from './discountSchedule';

// Framework-agnostic on purpose (no `server-only`, no Next.js imports) so it
// can be called from both the storefront (Next.js) and the admin panel
// (standalone Node/tsx process) without crossing a runtime boundary that
// doesn't support it.
type DecimalLike = Prisma.Decimal | number | string | null | undefined;

const toNumber = (value: DecimalLike): number => {
	if (value == null) return 0;
	if (typeof value === 'number') return value;
	if (typeof value === 'string') return Number(value) || 0;
	return value.toNumber();
};

const toNullableNumber = (value: DecimalLike): number | null => {
	if (value == null) return null;
	return toNumber(value);
};

export type DefaultVariantPriceFields = {
	price: DecimalLike;
	discountPrice: DecimalLike;
	discountStartAt: Date | null | undefined;
	discountEndAt: Date | null | undefined;
};

export type ProductEffectivePriceInput = {
	basePrice: DecimalLike;
	discountPrice: DecimalLike;
	discountStartAt: Date | null | undefined;
	discountEndAt: Date | null | undefined;
	// The single cheapest in-stock variant, if any — the same "default
	// variant" every product-listing query already selects via
	// `variants: { where: { stock: { gt: 0 } }, orderBy: [{ price: 'asc' }, ...], take: 1 }`.
	defaultVariant?: DefaultVariantPriceFields | null;
	now?: Date;
};

/**
 * The single source of truth for "what price should this product sort/filter
 * by right now" — a product's own base/discount price, or its cheapest
 * in-stock variant's price with the same discount-cascade rules, evaluated
 * at `now`. Every call site that needs an "effective price" (product listing
 * sort, the price-slider max, the materialized `Product.sortPrice` column)
 * must go through this function rather than re-deriving the logic, so the
 * displayed price and the sorted/filtered price can never silently diverge.
 */
export function computeProductEffectivePrice(input: ProductEffectivePriceInput): number {
	const now = input.now ?? new Date();
	const productBasePrice = toNumber(input.basePrice);
	const productDiscountPrice = toNullableNumber(input.discountPrice);
	const defaultVariant = input.defaultVariant;

	if (!defaultVariant) {
		const effective = getEffectiveDiscountPrice(
			productBasePrice,
			productDiscountPrice,
			input.discountStartAt ?? null,
			input.discountEndAt ?? null,
			now,
		);
		return effective ?? productBasePrice;
	}

	const variantBasePrice = toNumber(defaultVariant.price);
	const effective = getEffectiveVariantDiscountPrice({
		variantBasePrice,
		variantDiscountPrice: toNullableNumber(defaultVariant.discountPrice),
		variantDiscountStartAt: defaultVariant.discountStartAt ?? null,
		variantDiscountEndAt: defaultVariant.discountEndAt ?? null,
		productBasePrice,
		productDiscountPrice,
		productDiscountStartAt: input.discountStartAt ?? null,
		productDiscountEndAt: input.discountEndAt ?? null,
		now,
	});
	return effective ?? variantBasePrice;
}
