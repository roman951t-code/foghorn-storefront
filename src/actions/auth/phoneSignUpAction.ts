'use server';

import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { getPhoneSignUpSchema } from 'formValidationSchemas/phoneSignUpSchema';
import { autoVerifyPhoneNumber } from './phoneVerificationHelper';

export async function phoneSignUpAction(
	_: unknown,
	formData: unknown
): Promise<{ success: boolean; message?: string } | undefined> {
	const validationT = await getTranslations('validation');
	const schema = await getPhoneSignUpSchema();
	const validated = schema.safeParse(formData);

	if (!validated.success) {
		return { success: false, message: validationT('invalidFormData') };
	}

	const { phone, name } = validated.data;
	const rawPhone = phone.replace(/\D/g, '');

	try {
		const verificationResult = await autoVerifyPhoneNumber({
			phoneNumber: rawPhone,
			disableSession: false,
			updatePhoneNumber: false,
		});

		// Ensure the user's profile is up to date after auto-verification.
		if (verificationResult?.user?.id) {
			await prisma.user.update({
				where: { id: verificationResult.user.id },
				data: {
					name,
					notificationMethod: 'phone',
					phoneNumberVerified: true,
				},
			});
		}

		return { success: true };
	} catch (error: any) {
		const messageKey = error?.body?.message ?? error?.message ?? '';
		const errorMap: Record<string, string> = {
			'Phone number already exists': validationT('userExists'),
			'Too many requests': validationT('tooManyRequests'),
			'OTP not found': validationT('userRegisterFail'),
		};

		return {
			success: false,
			message: errorMap[messageKey] || validationT('userRegisterFail'),
		};
	}
}
