'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { decryptPassword } from '@/lib/crypto';
import { getTranslations } from 'next-intl/server';

export async function verifyEmailOtpAction(email: string, code: string) {
	const t = await getTranslations('Validation');

	const record = await prisma.emailVerificationCode.findFirst({
		where: {
			email,
			code,
			expiresAt: { gt: new Date() },
		},
		orderBy: { createdAt: 'desc' },
	});

	if (!record) {
		return { success: false, message: t('otpExpired') };
	}

	try {
		const decryptedPassword = decryptPassword(record.password);

		const user = await auth.api.signUpEmail({
			body: {
				email: record.email,
				password: decryptedPassword,
				name: record.name,
			},
		});

		await prisma.user.update({
			where: { id: user.user.id },
			data: { emailVerified: true, emailVerifiedAt: new Date() },
		});

		await prisma.emailVerificationCode.delete({ where: { id: record.id } });

		return { success: true };
	} catch {
		return { success: false, message: t('userRegisterFail') };
	}
}
