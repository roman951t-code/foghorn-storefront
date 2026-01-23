export const isDiscountActive = (
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

