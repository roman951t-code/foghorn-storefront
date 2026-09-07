const isDiscountActive = (
	discountPrice: number | null | undefined,
	discountStartAt: Date | null | undefined,
	discountEndAt: Date | null | undefined,
	now: Date = new Date()
) => {
	if (discountPrice == null) return false;
	if (!discountStartAt && !discountEndAt) return true;
	if (!discountStartAt || !discountEndAt) return false;
	return discountStartAt.getTime() <= now.getTime() && discountEndAt.getTime() > now.getTime();
};

export const getEffectiveDiscountPrice = (
	basePrice: number,
	discountPrice: number | null | undefined,
	discountStartAt: Date | null | undefined,
	discountEndAt: Date | null | undefined,
	now: Date = new Date()
) => {
	if (!isDiscountActive(discountPrice, discountStartAt, discountEndAt, now)) return null;
	if (discountPrice == null) return null;
	if (!(discountPrice > 0)) return null;
	if (!(discountPrice < basePrice)) return null;
	return discountPrice;
};

type EffectiveVariantDiscountPriceInput = {
	variantBasePrice: number;
	variantDiscountPrice: number | null | undefined;
	variantDiscountStartAt: Date | null | undefined;
	variantDiscountEndAt: Date | null | undefined;
	productBasePrice?: number | null | undefined;
	productDiscountPrice?: number | null | undefined;
	productDiscountStartAt?: Date | null | undefined;
	productDiscountEndAt?: Date | null | undefined;
	now?: Date;
};

export const getEffectiveVariantDiscountPrice = ({
	variantBasePrice,
	variantDiscountPrice,
	variantDiscountStartAt,
	variantDiscountEndAt,
	productBasePrice,
	productDiscountPrice,
	productDiscountStartAt,
	productDiscountEndAt,
	now = new Date(),
}: EffectiveVariantDiscountPriceInput): number | null => {
	const activeVariantDiscountPrice = getEffectiveDiscountPrice(
		variantBasePrice,
		variantDiscountPrice,
		variantDiscountStartAt,
		variantDiscountEndAt,
		now
	);
	if (activeVariantDiscountPrice != null) return activeVariantDiscountPrice;

	const normalizedProductBasePrice = Number(productBasePrice ?? 0);
	const normalizedProductDiscountPrice =
		productDiscountPrice == null ? null : Number(productDiscountPrice);
	const activeProductDiscountPrice = getEffectiveDiscountPrice(
		normalizedProductBasePrice,
		normalizedProductDiscountPrice,
		productDiscountStartAt ?? null,
		productDiscountEndAt ?? null,
		now
	);
	if (activeProductDiscountPrice == null) return null;

	const discountAmount = Math.max(
		0,
		normalizedProductBasePrice - activeProductDiscountPrice
	);
	if (!(discountAmount > 0)) return null;
	const discountedVariantPrice = Math.max(0, variantBasePrice - discountAmount);
	if (!(discountedVariantPrice < variantBasePrice)) return null;
	return discountedVariantPrice;
};
