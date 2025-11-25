'use server';

import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import { getAccountSchemas } from 'formValidationSchemas/accountSchema';
import { prisma } from '@/lib/prisma';
import { autoVerifyPhoneNumber } from './phoneVerificationHelper';
import { auth } from '@/lib/auth';

export async function updatePhoneNumberAction(
	_: unknown,
	formData: unknown
): Promise<{ success: boolean; message?: string } | undefined> {
	const t = await getTranslations('validation');
	const { phoneSchema } = await getAccountSchemas();
	const validated = phoneSchema.safeParse(formData);

	if (!validated.success) {
		return { success: false, message: t('invalidFormData') };
	}

	const { phone } = validated.data;
	const rawPhone = phone.replace(/\D/g, '');

	const session = await auth.api.getSession({ headers: await headers() });
	const currentUserId = session?.user?.id;

	if (!currentUserId) {
		return { success: false, message: t('userNotFound') };
	}

	const existingUserWithPhone = await prisma.user.findUnique({
		where: { phoneNumber: rawPhone },
		select: { id: true },
	});

	if (existingUserWithPhone && existingUserWithPhone.id !== currentUserId) {
		return { success: false, message: t('userExists') };
	}

	try {
		await autoVerifyPhoneNumber({
			phoneNumber: rawPhone,
			updatePhoneNumber: true,
			disableSession: true,
		});

		return { success: true };
	} catch (error: any) {
		const messageKey = error?.body?.message ?? error?.message ?? '';
		const errorMap: Record<string, string> = {
			'Phone number already exists': t('userExists'),
			'User not found': t('userNotFound'),
			'Too many requests': t('tooManyRequests'),
		};

		return {
			success: false,
			message: errorMap[messageKey] || t('userRegisterFail'),
		};
	}
}
