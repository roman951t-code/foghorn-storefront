'use server';

import 'server-only';

import { auth } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { getPhoneSignInSchema } from 'validationSchemas/phoneSignInSchema';

export async function sendVerifyPhoneAction(
	_: unknown,
	formData: unknown
): Promise<{ success: boolean; message?: string } | undefined> {
	const validationT = await getTranslations('validation');

	const schema = await getPhoneSignInSchema();
	const validatedFormData = schema.safeParse(formData);

	if (!validatedFormData.success) {
		return { success: false, message: validationT('invalidFormData') };
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
			'Too many requests': validationT('tooManyRequests'),
			'Unknown error': validationT('smsSendFailed'),
		};

		return {
			success: false,
			message: errorMap[error?.body?.message ?? ''] || validationT('smsSendFailed'),
		};
	}
}
