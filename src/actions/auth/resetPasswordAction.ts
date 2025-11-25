'use server';

import { getTranslations } from 'next-intl/server';
import { getResetPassSchema } from 'formValidationSchemas/resetPassSchema';
import { auth } from '@/lib/auth';

export async function resetPasswordAction(
	_: unknown,
	formData: unknown
): Promise<{ success: boolean; message?: string } | undefined> {
	const t = await getTranslations('validation');

	const schema = await getResetPassSchema();
	const validatedFormData = schema.safeParse(formData);

	if (!validatedFormData.success) {
		return { success: false, message: t('invalidFormData') };
	}

	const { email } = validatedFormData.data;

	try {
		await auth.api.forgetPasswordEmailOTP({
			body: {
				email,
			},
		});

		return { success: true };
	} catch (error: any) {
		const errorMap: Record<string, string> = {
			'Invalid email': t('wrongEmail'),
			'Missing email': t('emailRequired'),
			'Too many requests': t('tooManyRequests'),
			'Unknown error': t('setNewPassFail'),
		};

		return {
			success: false,
			message: errorMap[error?.body?.message ?? ''] || t('setNewPassFail'),
		};
	}
}
