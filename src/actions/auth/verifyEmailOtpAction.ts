'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';

export async function verifyEmailOtpAction(email: string, code: string) {
	const t = await getTranslations('Validation');

	const session = await auth.api.getSession({
		headers: await headers(),
	});
	const userId = session?.user?.id;

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
		await prisma.user.update({
			where: { id: userId },
			data: { email: record.email, emailVerified: true },
		});

		await prisma.emailVerificationCode.delete({ where: { id: record.id } });

		return { success: true };
	} catch {
		return { success: false, message: t('verificationFailed') };
	}
}
