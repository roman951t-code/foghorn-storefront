'use server';

import 'server-only';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import { updateTag } from 'next/cache';
import { productCacheTagById } from '@/constants/products';
import { syncProductReviewAggregate } from '@/lib/reviewAggregates';

export async function removeFeedback(
	productId: string
): Promise<{ success: boolean; message?: string }> {
	const validationT = await getTranslations('validation');
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	const userId = session?.user?.id;
	if (!userId) {
		return { success: false, message: validationT('userNotFound') };
	}

	try {
		await prisma.$transaction(async (tx) => {
			await tx.review.deleteMany({
				where: {
					userId,
					productId,
				},
			});

			await syncProductReviewAggregate(tx, productId);
		});

		await updateTag(productCacheTagById(productId));

		return { success: true };
	} catch (error: any) {
		return { success: false };
	}
}
