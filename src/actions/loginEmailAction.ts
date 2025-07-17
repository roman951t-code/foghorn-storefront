'use server';

import { getEmailSignInSchema } from 'formValidationSchemas/emailSignInSchema';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';

type LoginEmailResult = { message: string } | { success: true };

export async function loginEmailAction(
	prevState: unknown,
	formData: unknown
): Promise<LoginEmailResult> {
	const t = await getTranslations('Validation');

	const schema = await getEmailSignInSchema();
	const validatedFormData = schema.safeParse(formData);

	if (!validatedFormData.success) {
		return { message: t('invalidFormData') };
	}

	const { email } = validatedFormData.data;

	try {
		const existingUser = await prisma.user.findUnique({ where: { email } });
		console.log('existingUser', existingUser);

		if (!existingUser) {
			return { message: t('userNotFound') };
		}

		return { success: true };
	} catch (error: any) {
		return { message: t('userLoginFail') };
	}
}
