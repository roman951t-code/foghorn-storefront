'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';

export async function removeFeedback(
	productId: string
): Promise<{ success: boolean; message?: string }> {
	const t = await getTranslations('Validation');
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	const userId = session?.user?.id;
	if (!userId) {
		return { success: false, message: t('userNotFound') };
	}

	try {
		await prisma.review.delete({
			where: {
				userId_productId: {
					userId,
					productId,
				},
			},
		});

		return { success: true };
	} catch (error: any) {
		return { success: false };
	}
}
