'use server';

import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import { getTranslations } from 'next-intl/server';
import { emailSubscribeSchema } from 'formValidationSchemas/emailSubscribeSchema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const resend = new Resend(process.env.RESEND_API_KEY);

function generateOtp() {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendVerifyEmailAction(
	_: unknown,
	formData: unknown
): Promise<{ success: boolean; message?: string }> {
	const t = await getTranslations('validation');
	const authT = await getTranslations('auth');

	const schema = await emailSubscribeSchema({
		emailRequired: t('emailRequired'),
		inputMaxLength: t('inputMaxLength'),
		wrongEmail: t('wrongEmail'),
	});
	const validated = schema.safeParse(formData);

	if (!validated.success) {
		return { success: false, message: t('invalidFormData') };
	}

	const { email } = validated.data;

	const session = await auth.api.getSession({
		headers: await headers(),
	});
	const userId = session?.user?.id;

	if (!userId) {
		return { success: false, message: t('userNotFound') };
	}

	try {
		await prisma.emailVerificationCode.deleteMany({ where: { userId } });

		const otp = generateOtp();

		await prisma.emailVerificationCode.create({
			data: {
				email,
				userId,
				code: otp,
				expiresAt: new Date(Date.now() + 10 * 60 * 1000),
			},
		});

		await resend.emails.send({
			from: 'Acme <onboarding@resend.dev>',
			to: [email],
			subject: authT('verifyEmail'),
			text: `${authT('hiUser')} ${session.user.name ?? ''},\n\n${authT(
				'otpToVerifyEmail'
			)}:\n\n${otp}\n\n${authT('otpExpiresIn')}.`,
		});

		return { success: true };
	} catch (error) {
		return { success: false, message: t('smsSendFailed') };
	}
}
