'use server';

import { getTranslations } from 'next-intl/server';
import { getNewPassSchema } from 'formValidationSchemas/setNewpassSchema';
import { auth } from '@/lib/auth';

type FormValues = {
	password: string;
};

export async function setNewPasswordAction(
	prevState: unknown,
	payload: { formData: FormValues; token: string }
): Promise<{ message?: string } | undefined> {
	const t = await getTranslations('Validation');
	const { formData, token } = payload;

	const schema = await getNewPassSchema();
	const validatedFormData = schema.safeParse(formData);

	if (!validatedFormData.success) {
		return { message: t('invalidFormData') };
	}

	const { password } = validatedFormData.data;

	await auth.api.resetPassword({
		body: {
			newPassword: password,
			token,
		},
	});

	return;
}
