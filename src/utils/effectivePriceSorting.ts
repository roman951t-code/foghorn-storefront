import { Prisma } from '@prisma/client';
import { getEffectiveDiscountPrice } from '@/utils/discountSchedule';

type EffectivePriceSortableProduct = {
	id: string;
	basePrice: Prisma.Decimal | number | null | undefined;
	discountPrice: Prisma.Decimal | number | null | undefined;
	discountStartAt: Date | null | undefined;
	discountEndAt: Date | null | undefined;
	inStock?: boolean | null;
	name?: string | null;
};

export function getPaginatedIdsByEffectivePriceSort(
	products: EffectivePriceSortableProduct[],
	direction: 'asc' | 'desc',
	offset: number,
	limit: number,
	now: Date
): string[] {
	if (!products.length || limit <= 0) return [];

	const sorted = products
		.map((product) => {
			const basePrice = Number(product.basePrice ?? 0);
			const activeDiscountPrice = getEffectiveDiscountPrice(
				basePrice,
				product.discountPrice != null ? Number(product.discountPrice) : null,
				product.discountStartAt ?? null,
				product.discountEndAt ?? null,
				now
			);
			return {
				id: product.id,
				inStock: Boolean(product.inStock),
				name: product.name ?? '',
				effectivePrice: Number(activeDiscountPrice ?? basePrice),
			};
		})
		.sort((a, b) => {
			if (a.effectivePrice !== b.effectivePrice) {
				return direction === 'asc'
					? a.effectivePrice - b.effectivePrice
					: b.effectivePrice - a.effectivePrice;
			}

			if (a.inStock !== b.inStock) {
				return Number(b.inStock) - Number(a.inStock);
			}

			const byName = a.name.localeCompare(b.name);
			if (byName !== 0) return byName;

			return a.id.localeCompare(b.id);
		});

	return sorted.slice(offset, offset + limit).map((product) => product.id);
}
