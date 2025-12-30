'use server';

import 'server-only';

import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { getEmailSignUpSchema } from 'validationSchemas/emailSignUpSchema';
import { encryptPassword } from '@/lib/crypto';
import { DEFAULT_FROM, renderEmailTemplate, resendClient } from '@/lib/emailTemplates';

function generateOtp() {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendRegisterEmailAction(
	_: unknown,
	formData: unknown
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

	const { email, password, name } = validated.data;

	try {
		const existingUser = await prisma.user.findUnique({ where: { email } });

		if (existingUser) {
			return { success: false, message: validationT('userExists') };
		}

		await prisma.emailRegistrationCode.deleteMany({ where: { email } });

		const encryptedPassword = encryptPassword(password);
		const otp = generateOtp();

		await prisma.emailRegistrationCode.create({
			data: {
				email,
				name,
				password: encryptedPassword,
				code: otp,
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
			to: [email],
			subject: emailContent.subject,
			html: emailContent.html,
			text: emailContent.text,
		});

		return { success: true };
	} catch (error) {
		return { success: false, message: validationT('userRegisterFail') };
	}
}
