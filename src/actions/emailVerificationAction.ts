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
		const { error } = await authClient.emailOtp.verifyEmail({ email, otp });

		if (error) {
			const errorMap: Record<string, string> = {
				'Invalid OTP': t('invalidOtp'),
				'OTP expired': t('otpExpired'),
				'Too many attempts': t('tooManyAttempts'),
			};

			return {
				message: errorMap[error.message] || t('verificationFailed'),
			};
		}

		const user = await prisma.user.findUnique({ where: { email } });

		if (!user) {
			return { message: t('userNotFound') };
		}

		if (user.emailVerified) {
			return { message: t('alreadyVerified') };
		}

		await prisma.user.update({
			where: { email },
			data: {
				emailVerified: new Date(),
			},
		});

		return {};
	} catch (e) {
		console.error(e);
		return { message: t('verificationFailed') };
	}
}
