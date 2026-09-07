import type { MetadataRoute } from 'next';
import { cacheLife, cacheTag } from 'next/cache';
import { routing } from '@/i18n/routing';
import { absoluteUrl, localizePath } from '@/utils/seo';
import { LOCALE_TO_HTML_LANG, type AppLocale } from '@/constants/locales';
import { SITEMAP_STATIC_PATHS } from '@/constants/sitemap';
import { prisma } from '@/lib/prisma';
import { getPublishedProductWhere } from '@/utils/publishSchedule';
import { Prisma } from '@prisma/client';
import { PRODUCT_CATEGORY_CACHE_TAG, PRODUCT_LIST_CACHE_TAG } from '@/constants/products';

const normalizeProductFullSlug = (fullSlug: string) => fullSlug.replace(/^\/+/, '');
const TRANSIENT_DB_ERROR_CODES = new Set(['P1001', 'P1002', 'P1017', 'P2024']);
const SITEMAP_DB_QUERY_TIMEOUT_MS = 8000;

const buildSitemapLanguages = (pathname: string) => {
	const languages = routing.locales.reduce<Record<string, string>>((acc, locale) => {
		const appLocale = locale as AppLocale;
		acc[LOCALE_TO_HTML_LANG[appLocale] ?? locale] = absoluteUrl(
			localizePath(appLocale, pathname),
		);
		return acc;
	}, {});

	languages['x-default'] = absoluteUrl(
		localizePath(routing.defaultLocale as AppLocale, pathname),
	);
	return languages;
};

function isRetryableDbError(error: unknown): boolean {
	if (error instanceof Prisma.PrismaClientKnownRequestError) {
		return TRANSIENT_DB_ERROR_CODES.has(error.code);
	}

	if (error instanceof Prisma.PrismaClientInitializationError) {
		return true;
	}

	if (!(error instanceof Error)) return false;
	return /connection closed|connection terminated|econnreset|timed? out|too many clients/i.test(
		error.message
	);
}

async function withDbRetries<T>(
	label: string,
	operation: () => Promise<T>,
	maxAttempts = 3
): Promise<T | null> {
	for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
		let timeoutId: NodeJS.Timeout | undefined;
		try {
			const result = await Promise.race<T>([
				operation(),
				new Promise<never>((_, reject) => {
					timeoutId = setTimeout(() => {
						reject(new Error(`Query timed out after ${SITEMAP_DB_QUERY_TIMEOUT_MS}ms`));
					}, SITEMAP_DB_QUERY_TIMEOUT_MS);
				}),
			]);
			return result;
		} catch (error) {
			const shouldRetry = attempt < maxAttempts && isRetryableDbError(error);
			if (!shouldRetry) {
				console.error(`Sitemap ${label} error:`, error);
				return null;
			}

			await new Promise((resolve) => setTimeout(resolve, attempt * 200));
		} finally {
			if (timeoutId) clearTimeout(timeoutId);
		}
	}

	return null;
}

// Crawler traffic, not user traffic — same tags as the rest of the product
// catalog so a new/updated product shows up here on the same cadence it
// shows up everywhere else, instead of this route hitting Prisma fresh on
// every crawl.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	'use cache';
	cacheLife('hours');
	cacheTag(PRODUCT_LIST_CACHE_TAG, PRODUCT_CATEGORY_CACHE_TAG);

	const now = new Date();
	const locales = [...routing.locales] as AppLocale[];

	const baseEntries = locales.flatMap((locale) =>
		SITEMAP_STATIC_PATHS.map(({ path, priority }) => ({
			url: absoluteUrl(localizePath(locale, path)),
			changeFrequency: 'weekly' as const,
			priority,
			alternates: { languages: buildSitemapLanguages(path) },
		}))
	);

	let catalogEntries: MetadataRoute.Sitemap = [];
	let productEntries: MetadataRoute.Sitemap = [];

	const categories = await withDbRetries('catalog', () =>
		prisma.productCategory.findMany({
			where: { parentId: null },
			select: {
				slug: true,
				children: { select: { slug: true } },
			},
			orderBy: { slug: 'asc' },
		})
	);

	if (categories) {
		catalogEntries = categories.flatMap((category) =>
			locales.flatMap((locale) => {
				const categoryPath = `/products/${category.slug}`;
				const categoryUrl = absoluteUrl(localizePath(locale, categoryPath));
				const subcategories = category.children.map((child) => ({
					url: absoluteUrl(
						localizePath(locale, `/products/${category.slug}/${child.slug}`),
					),
					changeFrequency: 'weekly' as const,
					priority: 0.6,
					alternates: {
						languages: buildSitemapLanguages(
							`/products/${category.slug}/${child.slug}`,
						),
					},
				}));

				return [
					{
						url: categoryUrl,
						changeFrequency: 'weekly' as const,
						priority: 0.7,
						alternates: { languages: buildSitemapLanguages(categoryPath) },
					},
					...subcategories,
				];
			})
		);
	}

	const products = await withDbRetries('products', () =>
		prisma.product.findMany({
			where: { AND: [getPublishedProductWhere(now)] },
			select: {
				fullSlug: true,
				updatedAt: true,
			},
			orderBy: { updatedAt: 'desc' },
		})
	);

	if (products) {
		productEntries = products.flatMap((product) => {
			const normalizedFullSlug = normalizeProductFullSlug(product.fullSlug);
			if (!normalizedFullSlug) return [];

			const productPath = `/products/${normalizedFullSlug}`;
			const languages = buildSitemapLanguages(productPath);

			return locales.map((locale) => ({
				url: absoluteUrl(localizePath(locale, productPath)),
				lastModified: product.updatedAt,
				changeFrequency: 'daily' as const,
				priority: 0.8,
				alternates: { languages },
			}));
		});
	}

	return [...baseEntries, ...catalogEntries, ...productEntries];
}
