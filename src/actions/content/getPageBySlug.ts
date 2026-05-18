'use server';
import 'server-only';

import { Prisma } from '@prisma/client';
import { cacheLife, cacheTag } from 'next/cache';
import { DEFAULT_LOCALE } from '@/constants/locales';
import { prisma } from '@/lib/prisma';
import { getLocaleFallbacks, pickLocalizedTranslation } from '@/utils/localeFallback';

const PAGE_CACHE_TAG = 'pages';
const PRISMA_DB_UNAVAILABLE_CODES = new Set(['P1001', 'P1002', 'P1008', 'P1017']);

const isPrismaDbUnavailableError = (error: unknown) => {
	if (error instanceof Prisma.PrismaClientKnownRequestError) {
		return PRISMA_DB_UNAVAILABLE_CODES.has(error.code);
	}
	const code =
		typeof error === 'object' && error !== null ? (error as { code?: unknown }).code : undefined;
	return typeof code === 'string' && PRISMA_DB_UNAVAILABLE_CODES.has(code);
};

export async function getPageBySlug(slug: string, locale: string = DEFAULT_LOCALE) {
	'use cache';
	cacheLife('days');
	cacheTag(PAGE_CACHE_TAG, `page:${slug}`);

	const now = new Date();
	const localeFallbacks = getLocaleFallbacks(locale);

	const fetchPublishedPage = () =>
		prisma.page.findFirst({
			where: {
				slug,
				status: 'PUBLISHED',
				OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
			},
			select: {
				id: true,
				title: true,
				slug: true,
				excerpt: true,
				content: true,
				coverImageUrl: true,
				metaTitle: true,
				metaDescription: true,
				canonicalUrl: true,
				publishedAt: true,
				translations: {
					where: {
						locale: {
							in: localeFallbacks,
						},
					},
					select: {
						locale: true,
						title: true,
						excerpt: true,
						content: true,
						metaTitle: true,
						metaDescription: true,
					},
					orderBy: { updatedAt: 'desc' },
				},
			},
		});

	let page: Awaited<ReturnType<typeof fetchPublishedPage>>;
	try {
		page = await fetchPublishedPage();
	} catch (error) {
		if (isPrismaDbUnavailableError(error)) {
			return null;
		}
		throw error;
	}

	if (!page) return null;

	const translation = pickLocalizedTranslation(page.translations, locale);
	const { translations, ...basePage } = page;

	return {
		...basePage,
		title: translation?.title ?? page.title,
		excerpt: translation?.excerpt ?? page.excerpt,
		content: translation?.content ?? page.content,
		metaTitle: translation?.metaTitle ?? page.metaTitle,
		metaDescription: translation?.metaDescription ?? page.metaDescription,
	};
}
