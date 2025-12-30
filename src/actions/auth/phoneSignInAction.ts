'use server';

import 'server-only';

import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { getPhoneSignInSchema } from 'validationSchemas/phoneSignInSchema';
import { autoVerifyPhoneNumber } from './phoneVerificationHelper';

export async function phoneSignInAction(
	_: unknown,
	formData: unknown
): Promise<{ success: boolean; message?: string } | undefined> {
	const validationT = await getTranslations('validation');
	const schema = await getPhoneSignInSchema();
	const validated = schema.safeParse(formData);

	if (!validated.success) {
		return { success: false, message: validationT('invalidFormData') };
	}

	const { phone } = validated.data;
	const rawPhone = phone.replace(/\D/g, '');

	const existingUser = await prisma.user.findUnique({
		where: { phoneNumber: rawPhone },
		select: { id: true },
	});

	if (!existingUser) {
		return { success: false, message: validationT('userNotFound') };
	}

	try {
		await autoVerifyPhoneNumber({
			phoneNumber: rawPhone,
			disableSession: false,
			updatePhoneNumber: false,
		});

		return { success: true };
	} catch (error: any) {
		const messageKey = error?.body?.message ?? error?.message ?? '';
		const errorMap: Record<string, string> = {
			'Too many requests': validationT('tooManyRequests'),
			'Unknown error': validationT('smsSendFailed'),
		};

		return {
			success: false,
			message: errorMap[messageKey] || validationT('userLoginFail'),
		};
	}
}
