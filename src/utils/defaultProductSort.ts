import 'server-only';

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// Shared by every product-listing fetcher (subcategory, search, tag) so the
// "no orderBy selected" default is the same everywhere: promote popular, then
// new, then discounted, then promotional items ahead of the rest, each tier
// itself sorted in-stock-first. Extracted out of
// getProductsBySubcategorySlug.ts, which used to be the only caller.
const DEFAULT_TAG_PRIORITY = ['popular', 'new', 'discount', 'promotional'] as const;

const buildTagPriorityBuckets = (): Prisma.ProductWhereInput[] => {
	const hasTag = (tag: string): Prisma.ProductWhereInput => ({ tags: { has: tag } });
	const [popularTag, newTag, discountTag, promotionalTag] = DEFAULT_TAG_PRIORITY;

	return [
		hasTag(popularTag),
		{ AND: [hasTag(newTag), { NOT: hasTag(popularTag) }] },
		{
			AND: [
				hasTag(discountTag),
				{
					NOT: {
						OR: [hasTag(popularTag), hasTag(newTag)],
					},
				},
			],
		},
		{
			AND: [
				hasTag(promotionalTag),
				{
					NOT: {
						OR: [hasTag(popularTag), hasTag(newTag), hasTag(discountTag)],
					},
				},
			],
		},
		{
			NOT: {
				OR: DEFAULT_TAG_PRIORITY.map((tag) => hasTag(tag)),
			},
		},
	];
};

export async function getDefaultSortedProductPageIds({
	whereClause,
	limit,
	offset,
}: {
	whereClause: Prisma.ProductWhereInput;
	limit: number;
	offset: number;
}): Promise<string[]> {
	if (limit <= 0) return [];

	const priorityBuckets = buildTagPriorityBuckets();
	const bucketCounts = await Promise.all(
		priorityBuckets.map((bucketWhere) =>
			prisma.product.count({
				where: {
					AND: [whereClause, bucketWhere],
				},
			})
		)
	);

	let remainingOffset = offset;
	let remainingTake = limit;
	const pageIds: string[] = [];

	for (let bucketIndex = 0; bucketIndex < priorityBuckets.length && remainingTake > 0; bucketIndex += 1) {
		const bucketCount = bucketCounts[bucketIndex] ?? 0;
		if (bucketCount <= 0) continue;

		if (remainingOffset >= bucketCount) {
			remainingOffset -= bucketCount;
			continue;
		}

		const skipInBucket = remainingOffset;
		const takeInBucket = Math.min(remainingTake, bucketCount - skipInBucket);
		if (takeInBucket <= 0) {
			remainingOffset = 0;
			continue;
		}

		const idsInBucket = await prisma.product.findMany({
			where: {
				AND: [whereClause, priorityBuckets[bucketIndex]],
			},
			orderBy: [{ inStock: 'desc' }, { name: 'asc' }],
			skip: skipInBucket,
			take: takeInBucket,
			select: { id: true },
		});

		pageIds.push(...idsInBucket.map((product) => product.id));
		remainingTake -= takeInBucket;
		remainingOffset = 0;
	}

	return pageIds;
}
