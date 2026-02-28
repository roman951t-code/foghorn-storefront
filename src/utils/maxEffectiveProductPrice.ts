import 'server-only';

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
	getEffectiveDiscountPrice,
	getEffectiveVariantDiscountPrice,
} from '@/utils/discountSchedule';

export async function getMaxEffectiveProductPrice(
	whereClause: Prisma.ProductWhereInput,
	now: Date
): Promise<number> {
	const rows = await prisma.product.findMany({
		where: whereClause,
		select: {
			basePrice: true,
			discountPrice: true,
			discountStartAt: true,
			discountEndAt: true,
			variants: {
				where: { stock: { gt: 0 } },
				orderBy: [{ price: 'asc' }, { createdAt: 'asc' }],
				take: 1,
				select: {
					price: true,
					discountPrice: true,
					discountStartAt: true,
					discountEndAt: true,
				},
			},
		},
	});

	let maxPrice = 0;
	for (const row of rows) {
		const productBasePrice = Number(row.basePrice ?? 0);
		const defaultVariant = row.variants?.[0];
		const basePrice = defaultVariant ? Number(defaultVariant.price ?? 0) : productBasePrice;

		const effectiveDiscountPrice = defaultVariant
			? getEffectiveVariantDiscountPrice({
					variantBasePrice: basePrice,
					variantDiscountPrice:
						defaultVariant.discountPrice != null ? Number(defaultVariant.discountPrice) : null,
					variantDiscountStartAt: defaultVariant.discountStartAt ?? null,
					variantDiscountEndAt: defaultVariant.discountEndAt ?? null,
					productBasePrice,
					productDiscountPrice: row.discountPrice != null ? Number(row.discountPrice) : null,
					productDiscountStartAt: row.discountStartAt ?? null,
					productDiscountEndAt: row.discountEndAt ?? null,
					now,
				})
			: getEffectiveDiscountPrice(
					productBasePrice,
					row.discountPrice != null ? Number(row.discountPrice) : null,
					row.discountStartAt ?? null,
					row.discountEndAt ?? null,
					now
				);

		const effectivePrice = Number(effectiveDiscountPrice ?? basePrice ?? 0);
		if (effectivePrice > maxPrice) maxPrice = effectivePrice;
	}

	return maxPrice;
}
