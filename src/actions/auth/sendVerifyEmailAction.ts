'use server';

import 'server-only';

import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { emailSubscribeSchema } from 'validationSchemas/emailSubscribeSchema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { DEFAULT_FROM, renderEmailTemplate, resendClient } from '@/lib/emailTemplates';
import { checkRateLimit } from '@/lib/rateLimit';
import { generateOtpCode, hashOtpCode, normalizeEmailForOtp } from '@/lib/otp';

const OTP_SEND_LIMIT = 3;
const OTP_SEND_WINDOW_MS = 10 * 60 * 1000;

export async function sendVerifyEmailAction(
	_: unknown,
	formData: unknown
): Promise<{ success: boolean; message?: string }> {
	const [validationT, authT, emailsT] = await Promise.all([
		getTranslations('validation'),
		getTranslations('auth'),
		getTranslations('emails'),
	]);

	const schema = await emailSubscribeSchema({
		emailRequired: validationT('emailRequired'),
		inputMaxLength: validationT('inputMaxLength'),
		wrongEmail: validationT('wrongEmail'),
	});
	const validated = schema.safeParse(formData);

	if (!validated.success) {
		return { success: false, message: validationT('invalidFormData') };
	}

	const normalizedEmail = normalizeEmailForOtp(validated.data.email);

	const session = await auth.api.getSession({
		headers: await headers(),
	});
	const userId = session?.user?.id;

	if (!userId) {
		return { success: false, message: validationT('userNotFound') };
	}

	try {
		const sendRate = await checkRateLimit({
			key: `auth:email-verify:send:${userId}`,
			limit: OTP_SEND_LIMIT,
			windowMs: OTP_SEND_WINDOW_MS,
		});

		if (!sendRate.allowed) {
			return { success: false, message: validationT('tooManyRequests') };
		}

		await prisma.emailVerificationCode.deleteMany({ where: { userId } });

		const otp = generateOtpCode();
		const otpHash = hashOtpCode({
			otp,
			scope: 'email-verification',
			identifier: `${userId}:${normalizedEmail}`,
		});

		await prisma.emailVerificationCode.create({
			data: {
				email: normalizedEmail,
				userId,
				code: otpHash,
				expiresAt: new Date(Date.now() + 10 * 60 * 1000),
			},
		});

		const recipientName = session.user.name ?? normalizedEmail ?? emailsT('defaultRecipient');
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
		return { success: false, message: validationT('emailSendFailed') };
	}
}
