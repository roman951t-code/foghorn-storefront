'use server';

import 'server-only';

import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { getEmailSignUpSchema } from 'validationSchemas/emailSignUpSchema';
import { auth } from '@/lib/auth';
import { DEFAULT_FROM, renderEmailTemplate, resendClient } from '@/lib/emailTemplates';
import { headers } from 'next/headers';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { generateOtpCode, hashOtpCode, normalizeEmailForOtp } from '@/lib/otp';

const OTP_SEND_LIMIT_PER_EMAIL = 3;
const OTP_SEND_LIMIT_PER_IP = 20;
const OTP_SEND_WINDOW_MS = 10 * 60 * 1000;

export async function sendRegisterEmailAction(
	_: unknown,
	formData: unknown,
): Promise<{ success: boolean; message?: string }> {
	const [validationT, authT, emailsT] = await Promise.all([
		getTranslations('validation'),
		getTranslations('auth'),
		getTranslations('emails'),
	]);
	const schema = await getEmailSignUpSchema();
	const validated = schema.safeParse(formData);

	if (!validated.success) {
		return { success: false, message: validationT('invalidFormData') };
	}

	const { password, name } = validated.data;
	const normalizedEmail = normalizeEmailForOtp(validated.data.email);

	try {
		const requestHeaders = await headers();
		const ip = getClientIp(requestHeaders);
		const [emailRate, ipRate] = await Promise.all([
			checkRateLimit({
				key: `auth:email-register:send:email:${normalizedEmail}`,
				limit: OTP_SEND_LIMIT_PER_EMAIL,
				windowMs: OTP_SEND_WINDOW_MS,
			}),
			checkRateLimit({
				key: `auth:email-register:send:ip:${ip}`,
				limit: OTP_SEND_LIMIT_PER_IP,
				windowMs: OTP_SEND_WINDOW_MS,
			}),
		]);

		if (!emailRate.allowed || !ipRate.allowed) {
			return { success: false, message: validationT('tooManyRequests') };
		}

		const existingUser = await prisma.user.findUnique({
			where: { email: normalizedEmail },
			select: { id: true, emailVerified: true },
		});

		if (existingUser?.emailVerified) {
			return { success: false, message: validationT('userRegisterFail') };
		}

		if (existingUser) {
			await prisma.$transaction([
				prisma.emailRegistrationCode.deleteMany({ where: { email: normalizedEmail } }),
				prisma.emailVerificationCode.deleteMany({ where: { userId: existingUser.id } }),
				prisma.session.deleteMany({ where: { userId: existingUser.id } }),
				prisma.account.deleteMany({ where: { userId: existingUser.id } }),
				prisma.user.delete({ where: { id: existingUser.id } }),
			]);
		}

		await prisma.emailRegistrationCode.deleteMany({ where: { email: normalizedEmail } });

		await auth.api.signUpEmail({
			body: {
				email: normalizedEmail,
				password,
				name,
			},
		});

		const otp = generateOtpCode();
		const otpHash = hashOtpCode({
			otp,
			scope: 'email-registration',
			identifier: normalizedEmail,
		});

		await prisma.emailRegistrationCode.create({
			data: {
				email: normalizedEmail,
				code: otpHash,
				expiresAt: new Date(Date.now() + 10 * 60 * 1000),
			},
		});

		const recipientName = name || emailsT('defaultRecipient');
		const emailContent = renderEmailTemplate({
			subject: authT('verifyEmail'),
			title: authT('verifyEmail'),
			salutation: `${emailsT('greeting')} ${recipientName},`,
			intro: [emailsT('otpVerifyIntro')],
			detailRows: [{ label: emailsT('otpCodeLabel'), value: otp }],
			outro: [emailsT('otpExpires'), emailsT('ignoreIfNotYou')],
			footer: emailsT('signature'),
			brandName: emailsT('brandName'),
		});

		await resendClient.emails.send({
			from: DEFAULT_FROM,
			to: [normalizedEmail],
			subject: emailContent.subject,
			html: emailContent.html,
			text: emailContent.text,
		});

		return { success: true };
	} catch (error) {
		return { success: false, message: validationT('userRegisterFail') };
	}
}
