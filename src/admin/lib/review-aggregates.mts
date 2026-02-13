import type { PrismaClient } from '@prisma/client';

const normalizeProductIds = (productIds: readonly string[]) =>
	Array.from(
		new Set(
			productIds
				.map((productId) => productId.trim())
				.filter((productId): productId is string => productId.length > 0)
		)
	);

export async function syncProductReviewAggregates(
	client: PrismaClient,
	productIds: readonly string[]
): Promise<void> {
	const uniqueProductIds = normalizeProductIds(productIds);
	if (uniqueProductIds.length === 0) return;

	const aggregates = await client.review.groupBy({
		by: ['productId'],
		where: { productId: { in: uniqueProductIds } },
		_avg: { rating: true },
		_count: { _all: true },
	});

	const aggregateByProductId = new Map(
		aggregates.map((entry) => [
			entry.productId,
			{
				averageRating: entry._avg.rating ?? 0,
				reviewCount: entry._count._all,
			},
		])
	);

	for (const productId of uniqueProductIds) {
		const aggregate = aggregateByProductId.get(productId);
		await client.product.update({
			where: { id: productId },
			data: {
				averageRating: aggregate?.averageRating ?? 0,
				reviewCount: aggregate?.reviewCount ?? 0,
			},
		});
	}
}
