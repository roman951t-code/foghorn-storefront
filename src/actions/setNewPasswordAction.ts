'use server';

import { getTranslations } from 'next-intl/server';
import { getNewPassSchema } from 'formValidationSchemas/setNewpassSchema';
import { auth } from '@/lib/auth';

type FormValues = {
	password: string;
};

export async function setNewPasswordAction(
	_: unknown,
	payload: { formData: FormValues; token: string }
): Promise<{ success: boolean; message?: string } | undefined> {
	const t = await getTranslations('Validation');
	const { formData, token } = payload;

	const schema = await getNewPassSchema();
	const validatedFormData = schema.safeParse(formData);

	if (!validatedFormData.success) {
		return { success: false, message: t('invalidFormData') };
	}

	const { password } = validatedFormData.data;

	try {
		await auth.api.resetPassword({
			body: {
				newPassword: password,
				token,
			},
		});

		return { success: true };
	} catch (error: any) {
		return { success: false, message: t('setNewPassFail') };
	}
}
