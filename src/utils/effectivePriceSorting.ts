import { Prisma } from '@prisma/client';
import {
	getEffectiveDiscountPrice,
	getEffectiveVariantDiscountPrice,
} from '@/utils/discountSchedule';

type EffectivePriceSortableProduct = {
	id: string;
	basePrice: Prisma.Decimal | number | null | undefined;
	discountPrice: Prisma.Decimal | number | null | undefined;
	discountStartAt: Date | null | undefined;
	discountEndAt: Date | null | undefined;
	variants?:
		| {
				price: Prisma.Decimal | number | null | undefined;
				discountPrice: Prisma.Decimal | number | null | undefined;
				discountStartAt: Date | null | undefined;
				discountEndAt: Date | null | undefined;
		  }[]
		| null;
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
			const productBasePrice = Number(product.basePrice ?? 0);
			const defaultVariant = product.variants?.[0];
			const basePrice = defaultVariant
				? Number(defaultVariant.price ?? 0)
				: productBasePrice;
			const activeDiscountPrice = defaultVariant
				? getEffectiveVariantDiscountPrice({
						variantBasePrice: basePrice,
						variantDiscountPrice:
							defaultVariant.discountPrice != null ? Number(defaultVariant.discountPrice) : null,
						variantDiscountStartAt: defaultVariant.discountStartAt ?? null,
						variantDiscountEndAt: defaultVariant.discountEndAt ?? null,
						productBasePrice,
						productDiscountPrice:
							product.discountPrice != null ? Number(product.discountPrice) : null,
						productDiscountStartAt: product.discountStartAt ?? null,
						productDiscountEndAt: product.discountEndAt ?? null,
						now,
				  })
				: getEffectiveDiscountPrice(
						productBasePrice,
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
			if (a.inStock !== b.inStock) {
				return Number(b.inStock) - Number(a.inStock);
			}

			if (a.effectivePrice !== b.effectivePrice) {
				return direction === 'asc'
					? a.effectivePrice - b.effectivePrice
					: b.effectivePrice - a.effectivePrice;
			}

			const byName = a.name.localeCompare(b.name);
			if (byName !== 0) return byName;

			return a.id.localeCompare(b.id);
		});

	return sorted.slice(offset, offset + limit).map((product) => product.id);
}
