'use server';

import { getEmailSignInSchema } from 'formValidationSchemas/emailSignInSchema';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';

export async function loginEmailAction(
	prevState: unknown,
	formData: unknown
): Promise<{ message?: string } | undefined> {
	const t = await getTranslations('Validation');

	const schema = await getEmailSignInSchema();
	const validatedFormData = schema.safeParse(formData);

	if (!validatedFormData.success) {
		return { message: t('invalidFormData') };
	}

	const { email } = validatedFormData.data;

	try {
		const existingUser = await prisma.user.findUnique({ where: { email } });

		if (!existingUser) {
			return { message: t('userNotFound') };
		}

		return;
	} catch (error: any) {
		return {
			message: t('userLoginFail'),
		};
	}
}
