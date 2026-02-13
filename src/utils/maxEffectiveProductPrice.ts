import 'server-only';

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const getActiveDiscountScheduleWhere = (now: Date): Prisma.ProductWhereInput => ({
	OR: [
		{ discountStartAt: null, discountEndAt: null },
		{ discountStartAt: { lte: now }, discountEndAt: { gt: now } },
	],
});

const getValidActiveDiscountWhere = (now: Date): Prisma.ProductWhereInput => ({
	AND: [
		{
			discountPrice: {
				not: null,
				gt: 0,
				lt: prisma.product.fields.basePrice,
			},
		},
		getActiveDiscountScheduleWhere(now),
	],
});

export async function getMaxEffectiveProductPrice(
	whereClause: Prisma.ProductWhereInput,
	now: Date
): Promise<number> {
	const validActiveDiscountWhere = getValidActiveDiscountWhere(now);

	const [maxDiscountPrice, maxBasePrice] = await prisma.$transaction([
		prisma.product.aggregate({
			where: {
				AND: [whereClause, validActiveDiscountWhere],
			},
			_max: { discountPrice: true },
		}),
		prisma.product.aggregate({
			where: {
				AND: [whereClause, { NOT: validActiveDiscountWhere }],
			},
			_max: { basePrice: true },
		}),
	]);

	const discountCandidate = Number(maxDiscountPrice._max.discountPrice ?? 0);
	const baseCandidate = Number(maxBasePrice._max.basePrice ?? 0);

	return Math.max(discountCandidate, baseCandidate, 0);
}
