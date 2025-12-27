'use server';

import { getEmailSignInSchema } from 'formValidationSchemas/emailSignInSchema';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';

export async function loginEmailAction(
	_: unknown,
	formData: unknown
): Promise<{ success: boolean; message?: string } | undefined> {
	const validationT = await getTranslations('validation');

	const schema = await getEmailSignInSchema();
	const validatedFormData = schema.safeParse(formData);

	if (!validatedFormData.success) {
		return { success: false, message: validationT('invalidFormData') };
	}

	const { email } = validatedFormData.data;

	try {
		const existingUser = await prisma.user.findUnique({ where: { email } });

		if (!existingUser) {
			return { success: false, message: validationT('userNotFound') };
		}

		return { success: true };
	} catch (error: any) {
		return { success: false, message: validationT('userLoginFail') };
	}
}
