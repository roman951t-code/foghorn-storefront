'use server';

import 'server-only';

import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const MAX_RECENTLY_VIEWED = 32;
const PayloadSchema = z.object({
	userId: z.string().min(1, 'userId_required'),
	productId: z.string().min(1, 'productId_required'),
});

export async function trackProductView(userId: string, productId: string) {
	const parsed = PayloadSchema.safeParse({ userId, productId });
	if (!parsed.success) return;

	const session = await auth.api.getSession({ headers: await headers() });
	const sessionUserId = session?.user?.id;
	if (!sessionUserId || sessionUserId !== parsed.data.userId) return;

	try {
		await prisma.$transaction(async (tx) => {
			await tx.recentlyViewed.upsert({
				where: { userId_productId: { userId: parsed.data.userId, productId: parsed.data.productId } },
				create: { userId: parsed.data.userId, productId: parsed.data.productId },
				update: { updatedAt: new Date() },
			});

			const extraEntries = await tx.recentlyViewed.findMany({
				where: { userId: parsed.data.userId },
				orderBy: { updatedAt: 'desc' },
				skip: MAX_RECENTLY_VIEWED,
				select: { id: true },
			});

			if (extraEntries.length) {
				await tx.recentlyViewed.deleteMany({
					where: { id: { in: extraEntries.map((entry) => entry.id) } },
				});
			}
		});
	} catch (error) {
		console.error('Failed to track product view', error);
	}
}
