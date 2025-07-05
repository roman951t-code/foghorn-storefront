'use server';

import { authClient } from '@/lib/auth-client';
import { getTranslations } from 'next-intl/server';
import { getEmailSignUpSchema } from 'formValidationSchemas/emailSignUpSchema';
import { prisma } from '@/lib/prisma';

export async function registerEmailAction(
	prevState: unknown,
	formData: unknown
): Promise<{ message?: string } | undefined> {
	const t = await getTranslations('Validation');

	const schema = await getEmailSignUpSchema();
	const validatedFormData = schema.safeParse(formData);

	if (!validatedFormData.success) {
		return { message: t('invalidFormData') };
	}

	const { email, password, firstName, lastName } = validatedFormData.data;

	try {
		const existingUser = await prisma.user.findUnique({ where: { email } });

		if (existingUser) {
			return { message: t('userExists') };
		}

		const { data, error } = await authClient.signUp.email({
			email,
			password,
			name: `${firstName} ${lastName}`,
			image: '',
		});

		if (error) {
			const errorMap: Record<string, string> = {
				'User already exists': t('userExists'),
				'Invalid email': t('wrongEmail'),
				'Invalid password': t('wrongPassword'),
			};

			return {
				message: errorMap[error.message ?? ''] || t('userRegisterFail'),
			};
		}

		await authClient.sendVerificationEmail({
			email,
			callbackURL: '/?email-sign-in=true',
		});

		return;
	} catch (e: any) {
		if (e.code === 'P2002') {
			return { message: t('userExists') };
		}

		return { message: t('userRegisterFail') };
	}
}
