'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';

export async function setNotificationMethodAction(
	_: unknown,
	formData: { notificationMethod: 'email' | 'phone' }
): Promise<{ success: boolean; message?: string } | undefined> {
	const t = await getTranslations('Validation');

	const session = await auth.api.getSession({
		headers: await headers(),
	});
	console.log('session', session);

	if (!session?.user?.email) {
		return { success: false, message: t('userNotFound') };
	}

	try {
		await prisma.user.update({
			where: { email: session.user.email },
			data: {
				notificationMethod: formData.notificationMethod,
			},
		});

		return { success: true };
	} catch (error) {
		return { success: false, message: t('preferedNotifFailed') };
	}
}
