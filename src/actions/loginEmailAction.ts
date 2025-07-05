'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getEmailSignInSchema } from 'formValidationSchemas/emailSignInSchema';
import { getTranslations } from 'next-intl/server';
import { revalidatePath } from 'next/cache';

export async function loginEmailAction(
	prevState: unknown,
	formData: unknown
): Promise<{ message?: string } | undefined> {
	const t = await getTranslations('Validation');

	const authSchema = await getEmailSignInSchema();
	const validatedFormData = authSchema.safeParse(formData);

	if (!validatedFormData.success) {
		return { message: t('invalidFormData') };
	}

	const { email, password } = validatedFormData.data;

	try {
		const existingUser = await prisma.user.findUnique({ where: { email } });

		if (!existingUser) {
			return { message: t('userNotFound') };
		}

		await auth.api.signInEmail({
			body: {
				email,
				password,
			},
		});

		// if (error) {
		// 	const errorMap: Record<string, string> = {
		// 		'Invalid credentials': t('invalidFormData'),
		// 		'User not found': t('userNotFound'),
		// 		'Email not verified': t('emailNotVerified'),
		// 		'Too many attempts': t('tooManyAttempts'),
		// 	};

		// 	const messageKey = error?.message ?? '';
		// 	const message = errorMap[messageKey] || t('userLoginFail');

		// 	return { message };
		// }
		return;
	} catch (e) {
		return { message: t('userLoginFail') };
	}
}
