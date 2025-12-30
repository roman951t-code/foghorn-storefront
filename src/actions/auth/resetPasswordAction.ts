'use server';

import 'server-only';

import { getTranslations } from 'next-intl/server';
import { getResetPassSchema } from 'validationSchemas/resetPassSchema';
import { auth } from '@/lib/auth';

export async function resetPasswordAction(
	_: unknown,
	formData: unknown
): Promise<{ success: boolean; message?: string } | undefined> {
	const validationT = await getTranslations('validation');

	const schema = await getResetPassSchema();
	const validatedFormData = schema.safeParse(formData);

	if (!validatedFormData.success) {
		return { success: false, message: validationT('invalidFormData') };
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
			'Invalid email': validationT('wrongEmail'),
			'Missing email': validationT('emailRequired'),
			'Too many requests': validationT('tooManyRequests'),
			'Unknown error': validationT('setNewPassFail'),
		};

		return {
			success: false,
			message: errorMap[error?.body?.message ?? ''] || validationT('setNewPassFail'),
		};
	}
}
