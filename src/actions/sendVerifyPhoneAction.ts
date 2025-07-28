'use server';

import { auth } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { getPhoneSignInSchema } from 'formValidationSchemas/phoneSignInSchema';

export async function sendVerifyPhoneAction(
	_: unknown,
	formData: unknown
): Promise<{ success: boolean; message?: string } | undefined> {
	const t = await getTranslations('Validation');

	const schema = await getPhoneSignInSchema();
	const validatedFormData = schema.safeParse(formData);

	if (!validatedFormData.success) {
		return { success: false, message: t('invalidFormData') };
	}

	const { phone } = validatedFormData.data;
	const rawPhone = phone.replace(/\D/g, '');

	try {
		await prisma.verification.deleteMany({
			where: {
				identifier: rawPhone,
			},
		});

		await auth.api.sendPhoneNumberOTP({
			body: {
				phoneNumber: rawPhone,
			},
		});

		return { success: true };
	} catch (error: any) {
		const errorMap: Record<string, string> = {
			'Too many requests': t('tooManyRequests'),
			'Unknown error': t('smsSendFailed'),
		};

		return {
			success: false,
			message: errorMap[error?.body?.message ?? ''] || t('smsSendFailed'),
		};
	}
}
