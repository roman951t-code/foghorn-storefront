import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function GET(req: Request) {
	const ip = getClientIp(req);
	const rate = checkRateLimit({ key: `api:search:${ip}`, limit: 60, windowMs: 60_000 });
	if (!rate.allowed) {
		return NextResponse.json(
			{ products: [], subcategories: [], error: 'rate_limited' },
			{
				status: 429,
				headers: { 'Retry-After': String(rate.retryAfterSeconds) },
			}
		);
	}

	const { searchParams } = new URL(req.url);
	const query = searchParams.get('q')?.trim().slice(0, 64);

	if (!query || query.length < 2) {
		return NextResponse.json({ products: [], subcategories: [] });
	}

	const products = await prisma.product.findMany({
		where: {
			name: { contains: query, mode: 'insensitive' },
		},
		orderBy: [{ stock: 'desc' }, { name: 'asc' }],
		take: 7,
		select: {
			name: true,
			slug: true,
			category: {
				select: {
					slug: true,
					name: true,
					parent: {
						select: {
							slug: true,
						},
					},
				},
			},
		},
	});

	const productItems = products.map((p) => ({
		name: p.name,
		product: p.slug,
		category: p.category.parent?.slug || '',
		subcategory: p.category.slug,
	}));

	const uniqueSubcategoriesMap = new Map<
		string,
		{ name: string; subcategory: string; category: string }
	>();

	for (const p of products) {
		if (uniqueSubcategoriesMap.size >= 6) break;

		const key = p.category.slug;
		if (!uniqueSubcategoriesMap.has(key)) {
			uniqueSubcategoriesMap.set(key, {
				name: p.category.name,
				subcategory: p.category.slug,
				category: p.category.parent?.slug || '',
			});
		}
	}

	return NextResponse.json({
		products: productItems,
		subcategories: Array.from(uniqueSubcategoriesMap.values()),
	});
}
