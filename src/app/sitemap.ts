import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { absoluteUrl, localizePath } from '@/utils/seo';
import type { AppLocale } from '@/constants/locales';
import { SITEMAP_STATIC_PATHS } from '@/constants/sitemap';
import { prisma } from '@/lib/prisma';
import { getPublishedProductWhere } from '@/utils/publishSchedule';
import { pickLocalizedTranslation } from '@/utils/localeFallback';
import { Prisma } from '@prisma/client';

const normalizeProductFullSlug = (fullSlug: string) => fullSlug.replace(/^\/+/, '');
const TRANSIENT_DB_ERROR_CODES = new Set(['P1001', 'P1002', 'P1017', 'P2024']);
const SITEMAP_DB_QUERY_TIMEOUT_MS = 8000;

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const now = new Date();
	const locales = [...routing.locales] as AppLocale[];

	const baseEntries = locales.flatMap((locale) =>
		SITEMAP_STATIC_PATHS.map(({ path, priority }) => ({
			url: absoluteUrl(localizePath(locale, path)),
			lastModified: now,
			changeFrequency: 'weekly' as const,
			priority,
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
				const categoryUrl = absoluteUrl(localizePath(locale, `/products/${category.slug}`));
				const subcategories = category.children.map((child) => ({
					url: absoluteUrl(localizePath(locale, `/products/${category.slug}/${child.slug}`)),
					lastModified: now,
					changeFrequency: 'weekly' as const,
					priority: 0.6,
				}));

				return [
					{
						url: categoryUrl,
						lastModified: now,
						changeFrequency: 'weekly' as const,
						priority: 0.7,
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
				translations: {
					where: { locale: { in: locales } },
					select: { locale: true, fullSlug: true },
					orderBy: { updatedAt: 'desc' },
				},
			},
			orderBy: { updatedAt: 'desc' },
		})
	);

	if (products) {
		productEntries = products.flatMap((product) =>
			locales
				.map((locale) => {
					const translation = pickLocalizedTranslation(product.translations, locale);
					const fullSlug = translation?.fullSlug ?? product.fullSlug;
					if (!fullSlug) return null;

					const normalizedFullSlug = normalizeProductFullSlug(fullSlug);
					if (!normalizedFullSlug) return null;

					return {
						url: absoluteUrl(localizePath(locale, `/products/${normalizedFullSlug}`)),
						lastModified: product.updatedAt,
						changeFrequency: 'daily' as const,
						priority: 0.8,
					};
				})
				.filter((entry): entry is NonNullable<typeof entry> => entry !== null)
		);
	}

	return [...baseEntries, ...catalogEntries, ...productEntries];
}
