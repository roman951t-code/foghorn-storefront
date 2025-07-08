'use server';

import { getTranslations } from 'next-intl/server';
import { getNewPassSchema } from 'formValidationSchemas/setNewpassSchema';

export async function setNewPasswordAction(
	prevState: unknown,
	formData: unknown
): Promise<{ message?: string } | undefined> {
	const t = await getTranslations('Validation');

	const schema = await getNewPassSchema();
	const validatedFormData = schema.safeParse(formData);

	if (!validatedFormData.success) {
		return { message: t('invalidFormData') };
	}

	const { password } = validatedFormData.data;

	try {
		return;
	} catch (error: any) {
		return {
			message: t('setNewPassFail'),
		};
	}
}
