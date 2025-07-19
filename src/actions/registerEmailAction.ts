'use server';

import { auth } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';
import { getEmailSignUpSchema } from 'formValidationSchemas/emailSignUpSchema';
import { prisma } from '@/lib/prisma';

export async function registerEmailAction(
	_: unknown,
	formData: unknown
): Promise<{ success: boolean; message?: string } | undefined> {
	const t = await getTranslations('Validation');

	const schema = await getEmailSignUpSchema();
	const validatedFormData = schema.safeParse(formData);

	if (!validatedFormData.success) {
		return { success: false, message: t('invalidFormData') };
	}

	const { email, password, name } = validatedFormData.data;

	try {
		const existingUser = await prisma.user.findUnique({ where: { email } });

		if (existingUser) {
			return { success: false, message: t('userExists') };
		}

		await auth.api.signUpEmail({
			body: {
				email,
				password,
				name,
				callbackURL: '/?email-sign-in=true',
			},
		});

		await prisma.user.update({
			where: { email },
			data: { notificationMethod: 'email' },
		});

		return { success: true };
	} catch (error: any) {
		if (error.code === 'P2002') {
			return { success: false, message: t('userExists') };
		}

		const errorMap: Record<string, string> = {
			'User already exists': t('userExists'),
			'Invalid email': t('wrongEmail'),
			'Missing email': t('emailRequired'),
			'Invalid password': t('wrongPassword'),
			'Missing password': t('passwordRequired'),
			'Password is too weak': t('passwordTooWeak'),
			'Password is too short': t('passwordTooShort'),
			'Too many requests': t('tooManyRequests'),
			'Unknown error': t('userRegisterFail'),
		};

		return {
			success: false,
			message: errorMap[error?.body?.message ?? ''] || t('userRegisterFail'),
		};
	}
}
