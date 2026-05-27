import 'server-only';

import { routing } from '@/i18n/routing';
import { prisma } from '@/lib/prisma';
import { getPublishedProductWhere } from '@/utils/publishSchedule';

const STATIC_CATEGORY_LIMIT = 24;
const STATIC_SUBCATEGORY_LIMIT = 48;
const STATIC_PRODUCT_LIMIT = 64;

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

	return withLocales(categories.map(({ slug }) => ({ category: slug })));
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

	return withLocales(
		subcategories
			.filter((subcategory) => subcategory.parent?.slug)
			.map((subcategory) => ({
				category: subcategory.parent!.slug,
				subcategory: subcategory.slug,
			})),
	);
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

	return withLocales(
		products
			.filter((product) => product.category.parent?.slug)
			.map((product) => ({
				category: product.category.parent!.slug,
				subcategory: product.category.slug,
				product: product.slug,
			})),
	);
}
