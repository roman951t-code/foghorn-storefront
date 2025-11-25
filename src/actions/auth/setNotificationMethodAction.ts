'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';

export async function setNotificationMethodAction(
	_: unknown,
	formData: { notificationMethod: 'email' | 'phone' }
): Promise<{ success: boolean; message?: string } | undefined> {
	const t = await getTranslations('validation');

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user?.email && !session?.user?.phoneNumber) {
		return { success: false, message: t('userNotFound') };
	}

	try {
		if (session?.user?.email) {
			await prisma.user.update({
				where: { email: session.user.email },
				data: {
					notificationMethod: formData.notificationMethod,
				},
			});

			return { success: true };
		}

		if (session?.user?.phoneNumber) {
			await prisma.user.update({
				where: { phoneNumber: session.user.phoneNumber },
				data: {
					notificationMethod: formData.notificationMethod,
				},
			});

			return { success: true };
		}
	} catch (error) {
		return { success: false, message: t('preferedNotifFailed') };
	}
}
