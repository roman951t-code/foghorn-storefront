'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { decryptPassword } from '@/lib/crypto';
import { getTranslations } from 'next-intl/server';

export async function verifyEmailRegisterOtpAction(email: string, code: string) {
	const t = await getTranslations('validation');

	const record = await prisma.emailRegistrationCode.findFirst({
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
			data: { emailVerified: true },
		});

		await prisma.emailRegistrationCode.delete({ where: { id: record.id } });

		return { success: true };
	} catch {
		return { success: false, message: t('userRegisterFail') };
	}
}
