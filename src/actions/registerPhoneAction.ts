'use server';

import { getPhoneSignUpSchema } from 'formValidationSchemas/phoneSignUpSchema';
import { getTranslations } from 'next-intl/server';

export async function registerPhoneAction(
	_prevState: unknown,
	formData: FormData
): Promise<{ message?: string } | undefined> {
	const t = await getTranslations('Validation');

	if (!(formData instanceof FormData)) {
		return { message: t('invalidFormData') };
	}

	const data = Object.fromEntries(formData.entries());
	const schema = await getPhoneSignUpSchema();
	const validated = schema.safeParse(data);

	if (!validated.success) {
		return { message: t('invalidPhone') };
	}

	const { phone } = validated.data;

	try {
		console.log('Sending SMS to:', phone);
		// sendSMS(phone, '123456');
		return;
	} catch (error) {
		return { message: t('smsSendFailed') };
	}
}
