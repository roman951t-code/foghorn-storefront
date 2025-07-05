'use server';

import { authClient } from '@/lib/auth-client';
import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';

export async function emailVerificationAction(
	_: unknown,
	formData: { email: string; pin: string[] }
): Promise<{ message?: string }> {
	const t = await getTranslations('Validation');

	const otp = formData.pin.join('');
	const email = formData.email;

	try {
		const user = await prisma.user.findUnique({ where: { email } });

		if (!user) {
			return { message: t('userNotFound') };
		}

		if (user.emailVerified) {
			return { message: t('alreadyVerified') };
		}
		console.log('otp', otp);
		const { data, error: signInError } = await authClient.signIn.emailOtp({
			email,
			otp,
		});
		console.log('signInError', signInError);
		if (signInError) {
			const errorMap: Record<string, string> = {
				'Invalid OTP': t('invalidOtp'),
				'OTP expired': t('otpExpired'),
				'User not found': t('userNotFound'),
				'Too many attempts': t('tooManyAttempts'),
			};

			return {
				message: errorMap[signInError.message ?? ''] || t('signInFailed'),
			};
		}

		// await prisma.user.update({
		//   where: { email },
		//   data: { emailVerified: true },
		// });

		return {};
	} catch (e) {
		return { message: t('verificationFailed') };
	}
}
