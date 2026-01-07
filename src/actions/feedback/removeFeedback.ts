'use server';

import 'server-only';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import { revalidateTag, updateTag } from 'next/cache';
import { PRODUCT_LIST_CACHE_TAG, productCacheTagById } from '@/constants/products';

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
		await prisma.review.deleteMany({
			where: {
				userId,
				productId,
			},
		});

		await updateTag(productCacheTagById(productId));
		await revalidateTag(PRODUCT_LIST_CACHE_TAG, 'default');

		return { success: true };
	} catch (error: any) {
		return { success: false };
	}
}
