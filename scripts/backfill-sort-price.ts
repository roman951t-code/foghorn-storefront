import 'dotenv/config';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { computeProductEffectivePrice } from '@/utils/productEffectivePrice';

// The project's PrismaClient is constructed with a driver adapter
// (@prisma/adapter-pg) rather than schema-level `url = env(...)` — see
// src/lib/prisma.ts. This script builds its own minimal client the same way
// (rather than importing that shared one, which pulls in the whole app's
// validated env schema — RESEND_API_KEY and friends — that a standalone
// script has no reason to need).
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error('DATABASE_URL is not set.');
}
const dbHost = new URL(connectionString.replace(/^postgres(ql)?:\/\//, 'https://')).hostname;
const isLocalDb = ['localhost', '127.0.0.1', '::1', 'postgres'].includes(dbHost);
const urlWithoutSslMode = connectionString
	.replace(/\?sslmode=[^&]*&/, '?')
	.replace(/\?sslmode=[^&]*$/, '')
	.replace(/&sslmode=[^&]*/g, '');
const pool = new Pool({
	connectionString: urlWithoutSslMode,
	ssl: isLocalDb ? false : { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

// One-time (or run-whenever-needed) backfill for Product.sortPrice — the
// materialized "what price should this product sort/rank by right now"
// column the storefront's cheap/expensive sort and price-slider max query
// against directly (see src/utils/productEffectivePrice.ts, the single
// source of truth this mirrors). Needed once after the migration that adds
// the column (its own backfill only handles the product-level case, not the
// "cheapest in-stock variant" cascade — see that migration's SQL comment),
// and safe to re-run any time as a manual reconciliation pass — it's what
// `npm run build`'s seed step already does for every seeded product on every
// deploy (docs/cicd-pipeline.md §5), just outside of that reseed cycle.
async function main() {
	const now = new Date();
	const products = await prisma.product.findMany({
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

	console.log(`Recalculating sortPrice for ${products.length} products...`);

	let updated = 0;
	for (const product of products) {
		const sortPrice = computeProductEffectivePrice({
			basePrice: product.basePrice,
			discountPrice: product.discountPrice,
			discountStartAt: product.discountStartAt,
			discountEndAt: product.discountEndAt,
			defaultVariant: product.variants[0] ?? null,
			now,
		});
		await prisma.product.update({
			where: { id: product.id },
			data: { sortPrice: new Prisma.Decimal(sortPrice.toFixed(2)) },
		});
		updated += 1;
	}

	console.log(`Done — sortPrice recalculated for ${updated} products.`);
}

main()
	.catch((error) => {
		console.error('sortPrice backfill failed:', error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
