'use server';

import 'server-only';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import { z } from 'zod';

const notificationMethodSchema = z.object({
	notificationMethod: z.enum(['email', 'phone']),
});

export async function setNotificationMethodAction(
	_: unknown,
	formData: unknown
): Promise<{ success: boolean; message?: string } | undefined> {
	const validationT = await getTranslations('validation');
	const parsed = notificationMethodSchema.safeParse(formData);

	if (!parsed.success) {
		return { success: false, message: validationT('invalidFormData') };
	}

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user?.email && !session?.user?.phoneNumber) {
		return { success: false, message: validationT('userNotFound') };
	}

	try {
		if (session?.user?.email) {
			await prisma.user.update({
				where: { email: session.user.email },
				data: {
					notificationMethod: parsed.data.notificationMethod,
				},
			});

			return { success: true };
		}

		if (session?.user?.phoneNumber) {
			await prisma.user.update({
				where: { phoneNumber: session.user.phoneNumber },
				data: {
					notificationMethod: parsed.data.notificationMethod,
				},
			});

			return { success: true };
		}
	} catch (error) {
		return { success: false, message: validationT('preferedNotifFailed') };
	}
}
