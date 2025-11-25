'use server';

import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';

export async function registerPhoneAction(
	_: unknown,
	formData: unknown
): Promise<{ success: boolean; message?: string } | undefined> {
	const t = await getTranslations('validation');

	const { phone, name } = formData as { name: string; phone: string };
	const rawPhone = phone.replace(/\D/g, '');

	try {
		await prisma.user.update({
			where: { phoneNumber: rawPhone },
			data: { name, notificationMethod: 'phone' },
		});

		return { success: true };
	} catch {
		return {
			success: false,
			message: t('userRegisterFail'),
		};
	}
}
