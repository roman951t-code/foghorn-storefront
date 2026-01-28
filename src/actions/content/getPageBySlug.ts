'use server';
import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function getPageBySlug(slug: string) {
	'use cache';
	cacheLife('minutes');
	cacheTag(`page:${slug}`);

	const now = new Date();
	return prisma.page.findFirst({
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
		},
	});
}
