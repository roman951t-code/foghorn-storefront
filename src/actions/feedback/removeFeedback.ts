'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import { revalidateTag } from 'next/cache';

export async function removeFeedback(
	productId: string
): Promise<{ success: boolean; message?: string }> {
	const t = await getTranslations('validation');
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	const userId = session?.user?.id;
	if (!userId) {
		return { success: false, message: t('userNotFound') };
	}

	try {
		await prisma.review.deleteMany({
			where: {
				userId,
				productId,
			},
		});

		revalidateTag('products', 'default');
		revalidateTag('product-by-slug', 'default');

		return { success: true };
	} catch (error: any) {
		return { success: false };
	}
}
