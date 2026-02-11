'use server';

import 'server-only';

import { getEmailSignInSchema } from 'validationSchemas/emailSignInSchema';
import { getTranslations } from 'next-intl/server';

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

	try {
		return { success: true };
	} catch (error: any) {
		return { success: false, message: validationT('userLoginFail') };
	}
}
