import { Prisma, type PrismaClient } from '@prisma/client';
import { computeProductEffectivePrice } from '../../utils/productEffectivePrice';

type ProductSortPriceClient = PrismaClient | Prisma.TransactionClient;

// Recomputes Product.sortPrice — the materialized "what price should this
// product sort/rank by right now" column the storefront's cheap/expensive
// sort and price-slider max query against directly (see
// src/utils/productEffectivePrice.ts, the single source of truth this
// mirrors). Shared by every admin write path that touches product/variant
// pricing or stock (the resource mutation hooks in resources/index.mts, CSV
// import in product-csv-actions.mts) so none of them can silently drift out
// of sync with the storefront. Deliberately tolerant of a missing/stale row:
// worst case here is the storefront sort briefly lags, never a wrong price
// shown to a customer (the actual displayed price is always resolved live,
// never from this column).
export const recalculateProductSortPrices = async (
	client: ProductSortPriceClient,
	productIds: readonly string[],
) => {
	const uniqueIds = Array.from(new Set(productIds.filter(Boolean)));
	if (uniqueIds.length === 0) return;

	const now = new Date();
	const products = await client.product.findMany({
		where: { id: { in: uniqueIds } },
		select: {
			id: true,
			basePrice: true,
			discountPrice: true,
			discountStartAt: true,
			discountEndAt: true,
			variants: {
				where: { stock: { gt: 0 } },
				orderBy: [{ price: 'asc' }, { createdAt: 'asc' }],
				take: 1,
				select: { price: true, discountPrice: true, discountStartAt: true, discountEndAt: true },
			},
		},
	});

	if (products.length === 0) return;

	await Promise.all(
		products.map((product) => {
			const sortPrice = computeProductEffectivePrice({
				basePrice: product.basePrice,
				discountPrice: product.discountPrice,
				discountStartAt: product.discountStartAt,
				discountEndAt: product.discountEndAt,
				defaultVariant: product.variants[0] ?? null,
				now,
			});
			return client.product.update({
				where: { id: product.id },
				data: { sortPrice: new Prisma.Decimal(sortPrice.toFixed(2)) },
			});
		}),
	);
};
