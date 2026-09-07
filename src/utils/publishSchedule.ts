import type { Prisma, ProductStatus } from '@prisma/client';

export const isProductPublished = (
	status: string | null | undefined,
	publishStartAt: Date | null | undefined,
	publishEndAt: Date | null | undefined,
	now: Date = new Date()
) => {
	if (status === 'ARCHIVED') return false;
	const start = publishStartAt ?? null;
	const end = publishEndAt ?? null;
	if (start && start.getTime() > now.getTime()) return false;
	if (end && end.getTime() <= now.getTime()) return false;
	if (!start && !end) return status === 'ACTIVE';
	if (status === 'ACTIVE') return true;
	return Boolean(start);
};

export const getPublishedProductWhere = (now: Date = new Date()): Prisma.ProductWhereInput => ({
	OR: [
		{ status: 'ACTIVE' as ProductStatus, publishStartAt: null, publishEndAt: null },
		{ status: 'ACTIVE' as ProductStatus, publishStartAt: { lte: now }, publishEndAt: null },
		{ status: 'ACTIVE' as ProductStatus, publishStartAt: null, publishEndAt: { gt: now } },
		{ status: 'ACTIVE' as ProductStatus, publishStartAt: { lte: now }, publishEndAt: { gt: now } },
		{ status: 'DRAFT' as ProductStatus, publishStartAt: { lte: now }, publishEndAt: null },
		{ status: 'DRAFT' as ProductStatus, publishStartAt: { lte: now }, publishEndAt: { gt: now } },
	],
});
