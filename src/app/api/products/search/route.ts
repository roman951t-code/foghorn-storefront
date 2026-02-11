import { NextResponse } from 'next/server';
import { DEFAULT_LOCALE } from '@/constants/locales';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { getLocaleFallbacks, pickLocalizedTranslation } from '@/utils/localeFallback';
import { getPublishedProductWhere } from '@/utils/publishSchedule';

export async function GET(req: Request) {
	const ip = getClientIp(req);
	const rate = await checkRateLimit({ key: `api:search:${ip}`, limit: 60, windowMs: 60_000 });
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
	const locale = searchParams.get('locale')?.trim().toLowerCase() || DEFAULT_LOCALE;
	const localeFallbacks = getLocaleFallbacks(locale);

	if (!query || query.length < 2) {
		return NextResponse.json({ products: [], subcategories: [] });
	}

	const products = await prisma.product.findMany({
		where: {
			OR: [
				{ name: { contains: query, mode: 'insensitive' } },
				{
					translations: {
						some: {
							locale: { in: localeFallbacks },
							name: { contains: query, mode: 'insensitive' },
						},
					},
				},
			],
			AND: [getPublishedProductWhere()],
		},
		orderBy: [{ stock: 'desc' }, { name: 'asc' }],
		take: 7,
		select: {
			name: true,
			slug: true,
			translations: {
				where: { locale: { in: localeFallbacks } },
				select: {
					locale: true,
					name: true,
					categoryName: true,
					subcategoryName: true,
				},
				orderBy: { updatedAt: 'desc' },
			},
			category: {
				select: {
					slug: true,
					name: true,
					translations: {
						where: { locale: { in: localeFallbacks } },
						select: { locale: true, name: true },
						orderBy: { updatedAt: 'desc' },
					},
					parent: {
						select: {
							slug: true,
							name: true,
							translations: {
								where: { locale: { in: localeFallbacks } },
								select: { locale: true, name: true },
								orderBy: { updatedAt: 'desc' },
							},
						},
					},
				},
			},
		},
	});

	const productItems = products.map((p) => {
		const productTranslation = pickLocalizedTranslation(p.translations, locale);
		const subcategoryTranslation = pickLocalizedTranslation(p.category.translations, locale);
		const categoryTranslation = pickLocalizedTranslation(p.category.parent?.translations, locale);

		return {
			type: 'product' as const,
			name: productTranslation?.name ?? p.name,
			product: p.slug,
			category: p.category.parent?.slug || '',
			subcategory: p.category.slug,
			categoryName:
				productTranslation?.categoryName ?? categoryTranslation?.name ?? p.category.parent?.name ?? '',
			subcategoryName:
				productTranslation?.subcategoryName ?? subcategoryTranslation?.name ?? p.category.name,
		};
	});

	const uniqueSubcategoriesMap = new Map<
		string,
		{ name: string; subcategory: string; category: string }
	>();

	for (const p of products) {
		if (uniqueSubcategoriesMap.size >= 6) break;

		const key = p.category.slug;
		if (!uniqueSubcategoriesMap.has(key)) {
			const subcategoryTranslation = pickLocalizedTranslation(p.category.translations, locale);
			uniqueSubcategoriesMap.set(key, {
				name: subcategoryTranslation?.name ?? p.category.name,
				subcategory: p.category.slug,
				category: p.category.parent?.slug || '',
			});
		}
	}

	return NextResponse.json({
		products: productItems,
		subcategories: Array.from(uniqueSubcategoriesMap.values()).map((item) => ({
			type: 'subcategory' as const,
			...item,
		})),
	});
}
