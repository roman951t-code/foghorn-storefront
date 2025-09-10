'use server';

import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import { getTranslations } from 'next-intl/server';
import { getEmailSignUpSchema } from 'formValidationSchemas/emailSignUpSchema';
import { encryptPassword } from '@/lib/crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

function generateOtp() {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendVerifyEmailAction(
	_: unknown,
	formData: unknown
): Promise<{ success: boolean; message?: string }> {
	const t = await getTranslations('Validation');
	const authT = await getTranslations('Auth');
	const schema = await getEmailSignUpSchema();
	const validated = schema.safeParse(formData);

	if (!validated.success) {
		return { success: false, message: t('invalidFormData') };
	}

	const { email, password, name } = validated.data;

	try {
		const existingUser = await prisma.user.findUnique({ where: { email } });

		if (existingUser) {
			return { success: false, message: t('userExists') };
		}

		await prisma.emailVerificationCode.deleteMany({ where: { email } });

		const encryptedPassword = encryptPassword(password);
		const otp = generateOtp();

		await prisma.emailVerificationCode.create({
			data: {
				email,
				name,
				password: encryptedPassword,
				code: otp,
				expiresAt: new Date(Date.now() + 10 * 60 * 1000),
			},
		});

		await resend.emails.send({
			from: 'Acme <onboarding@resend.dev>',
			to: [email],
			subject: authT('verifyEmail'),
			text: `${authT('hiUser')} ${name},\n\n${authT('otpToVerifyEmail')}:\n\n${otp}\n\n${authT(
				'otpExpiresIn'
			)}.`,
		});

		return { success: true };
	} catch (error) {
		return { success: false, message: t('userRegisterFail') };
	}
}
