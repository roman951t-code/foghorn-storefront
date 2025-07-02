'use server';

import bcrypt from 'bcryptjs';
import { authClient } from '@/lib/auth-client';
import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';

export async function resetPasswordAction(
	email: string,
	otp: string,
	newPassword: string
): Promise<{ success?: boolean; error?: string }> {
	const t = await getTranslations('Validation');

	try {
		// Step 1: Reset password through Better Auth
		const { error } = await authClient.emailOtp.resetPassword({
			email,
			otp,
			password: newPassword,
		});

		if (error) {
			const errorMap: Record<string, string> = {
				'Invalid OTP': t('invalidOtp'),
				'OTP expired': t('otpExpired'),
				'Too many attempts': t('tooManyAttempts'),
			};

			return { error: errorMap[error.message] || t('verificationFailed') };
		}

		// Step 2: Update hashed password in your DB
		const hashed = await bcrypt.hash(newPassword, 10);

		await prisma.user.update({
			where: { email },
			data: { hashedPassword: hashed },
		});

		return { success: true };
	} catch (err) {
		console.error('Reset password failed:', err);
		return { error: t('verificationFailed') };
	}
}
