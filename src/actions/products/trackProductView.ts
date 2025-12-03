'use server';

import { prisma } from '@/lib/prisma';

const MAX_RECENTLY_VIEWED = 16;

export async function trackProductView(userId: string, productId: string) {
	if (!userId || !productId) return;

	try {
		await prisma.recentlyViewed.upsert({
			where: { userId_productId: { userId, productId } },
			create: { userId, productId },
			update: { updatedAt: new Date() },
		});

		const extraEntries = await prisma.recentlyViewed.findMany({
			where: { userId },
			orderBy: { updatedAt: 'desc' },
			skip: MAX_RECENTLY_VIEWED,
			select: { id: true },
		});

		if (extraEntries.length) {
			await prisma.recentlyViewed.deleteMany({
				where: { id: { in: extraEntries.map((entry) => entry.id) } },
			});
		}
	} catch (error) {
		console.error('Failed to track product view', error);
	}
}
