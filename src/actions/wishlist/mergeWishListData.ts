'use server';

import 'server-only';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { getPublishedProductWhere } from '@/utils/publishSchedule';

export async function mergeWishListData(localItems: { id: string }[]) {
	const wishlistT = await getTranslations('wishlist');

	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id;

	if (!userId) return { success: false };

	try {
		const normalizedIds = Array.from(
			new Set(
				localItems
					.map((item) => item.id?.trim?.())
					.filter((id): id is string => !!id)
			)
		).slice(0, 100);

		if (!normalizedIds.length) {
			return { success: false, message: wishlistT('wishlistUpdateFailed') };
		}

		const products = await prisma.product.findMany({
			where: { id: { in: normalizedIds }, inStock: true, AND: [getPublishedProductWhere()] },
			select: { id: true },
		});
		const validIds = new Set(products.map((p) => p.id));

		await prisma.$transaction(async (tx) => {
			const existing = await tx.wishlist.findMany({
				where: { userId },
				select: { productId: true },
			});

			const existingIds = new Set(existing.map((w) => w.productId));
			const idsToInsert = normalizedIds.filter((id) => validIds.has(id) && !existingIds.has(id));

			if (!idsToInsert.length) return;

			await tx.wishlist.createMany({
				data: idsToInsert.map((id) => ({ userId, productId: id })),
				skipDuplicates: true,
			});
		});

		return { success: true };
	} catch (error) {
		return { success: false, message: wishlistT('wishlistUpdateFailed') };
	}
}
