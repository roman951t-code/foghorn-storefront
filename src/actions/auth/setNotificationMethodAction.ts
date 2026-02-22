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
	const userId = session?.user?.id;

	if (!userId) {
		return { success: false, message: validationT('userNotFound') };
	}

	try {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { id: true, email: true, phoneNumber: true },
		});
		if (!user) {
			return { success: false, message: validationT('userNotFound') };
		}

		const wantsEmail = parsed.data.notificationMethod === 'email';
		const wantsPhone = parsed.data.notificationMethod === 'phone';
		if ((wantsEmail && !user.email) || (wantsPhone && !user.phoneNumber)) {
			return { success: false, message: validationT('preferedNotifFailed') };
		}

		await prisma.user.update({
			where: { id: user.id },
			data: { notificationMethod: parsed.data.notificationMethod },
		});

		return { success: true };
	} catch {
		return { success: false, message: validationT('preferedNotifFailed') };
	}
}
