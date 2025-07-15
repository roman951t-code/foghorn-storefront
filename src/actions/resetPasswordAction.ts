'use server';

import { getTranslations } from 'next-intl/server';
import { getResetPassSchema } from 'formValidationSchemas/resetPassSchema';
import { auth } from '@/lib/auth';

export async function resetPasswordAction(
	prevState: unknown,
	formData: unknown
): Promise<{ message?: string } | undefined> {
	const t = await getTranslations('Validation');

	const schema = await getResetPassSchema();
	const validatedFormData = schema.safeParse(formData);

	if (!validatedFormData.success) {
		return { message: t('invalidFormData') };
	}

	const { email } = validatedFormData.data;

	try {
		await auth.api.requestPasswordReset({
			body: {
				email,
				redirectTo: '/?reset-pass=true',
			},
		});
	} catch (error: any) {
		const errorMap: Record<string, string> = {
			'Invalid email': t('wrongEmail'),
			'Missing email': t('emailRequired'),
			'Too many requests': t('tooManyRequests'),
			'Unknown error': t('setNewPassFail'),
		};

		return {
			message: errorMap[error?.body?.message ?? ''] || t('setNewPassFail'),
		};
	}
}
