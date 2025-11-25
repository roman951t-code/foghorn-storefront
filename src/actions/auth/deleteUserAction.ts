'use server';

import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function deleteUserAction(): Promise<{ success: boolean; message?: string }> {
	const t = await getTranslations('validation');

	const session = await auth.api.getSession({
		headers: await headers(),
	});
	const userId = session?.user?.id;

	if (!userId) {
		return { success: false, message: t('userNotFound') };
	}

	try {
		await prisma.session.deleteMany({ where: { userId } });
		await prisma.account.deleteMany({ where: { userId } });
		await prisma.user.delete({
			where: { id: userId },
		});

		return { success: true };
	} catch (error) {
		return { success: false, message: t('deleteFailed') };
	}
}
