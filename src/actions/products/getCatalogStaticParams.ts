import 'server-only';

import { routing } from '@/i18n/routing';
import { prisma } from '@/lib/prisma';
import { getPublishedProductWhere } from '@/utils/publishSchedule';

const STATIC_CATEGORY_LIMIT = 24;
const STATIC_SUBCATEGORY_LIMIT = 48;
// Pre-render a portfolio-sized catalog with enough headroom for normal growth.
// Product pages outside this set still work, but their first crawler request
// has to wait for a cold database-backed render.
const STATIC_PRODUCT_LIMIT = 250;

const withLocales = <T extends Record<string, string>>(params: T[]) =>
	routing.locales.flatMap((locale) => params.map((param) => ({ locale, ...param })));

export async function getCategoryStaticParams() {
	const now = new Date();
	const categories = await prisma.productCategory.findMany({
		where: {
			parentId: null,
			children: {
				some: {
					products: { some: getPublishedProductWhere(now) },
				},
			},
		},
		select: { slug: true },
		orderBy: { name: 'asc' },
		take: STATIC_CATEGORY_LIMIT,
	});

	const params = withLocales(categories.map(({ slug }) => ({ category: slug })));
	// cacheComponents requires ≥1 entry; placeholder 404s at runtime via notFound()
	if (params.length === 0) return routing.locales.map((locale) => ({ locale, category: '_' }));
	return params;
}

export async function getSubcategoryStaticParams() {
	const now = new Date();
	const subcategories = await prisma.productCategory.findMany({
		where: {
			parentId: { not: null },
			products: { some: getPublishedProductWhere(now) },
		},
		select: {
			slug: true,
			parent: { select: { slug: true } },
		},
		orderBy: { name: 'asc' },
		take: STATIC_SUBCATEGORY_LIMIT,
	});

	const params = withLocales(
		subcategories
			.filter((subcategory) => subcategory.parent?.slug)
			.map((subcategory) => ({
				category: subcategory.parent!.slug,
				subcategory: subcategory.slug,
			})),
	);
	if (params.length === 0)
		return routing.locales.map((locale) => ({ locale, category: '_', subcategory: '_' }));
	return params;
}

export async function getProductStaticParams() {
	const now = new Date();
	const products = await prisma.product.findMany({
		where: {
			AND: [getPublishedProductWhere(now), { category: { parentId: { not: null } } }],
		},
		select: {
			slug: true,
			category: {
				select: {
					slug: true,
					parent: { select: { slug: true } },
				},
			},
		},
		orderBy: [{ reviewCount: 'desc' }, { createdAt: 'desc' }],
		take: STATIC_PRODUCT_LIMIT,
	});

	const params = withLocales(
		products
			.filter((product) => product.category.parent?.slug)
			.map((product) => ({
				category: product.category.parent!.slug,
				subcategory: product.category.slug,
				product: product.slug,
			})),
	);
	if (params.length === 0)
		return routing.locales.map((locale) => ({
			locale,
			category: '_',
			subcategory: '_',
			product: '_',
		}));
	return params;
}
