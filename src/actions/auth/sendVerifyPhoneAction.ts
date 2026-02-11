'use server';

import 'server-only';

import { auth } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { getPhoneSignInSchema } from 'validationSchemas/phoneSignInSchema';
import { headers } from 'next/headers';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

const PHONE_OTP_SEND_LIMIT_PER_PHONE = 3;
const PHONE_OTP_SEND_LIMIT_PER_IP = 20;
const PHONE_OTP_SEND_WINDOW_MS = 10 * 60 * 1000;

export async function sendVerifyPhoneAction(
	_: unknown,
	formData: unknown
): Promise<{ success: boolean; message?: string } | undefined> {
	const validationT = await getTranslations('validation');

	const schema = await getPhoneSignInSchema();
	const validatedFormData = schema.safeParse(formData);

	if (!validatedFormData.success) {
		return { success: false, message: validationT('invalidFormData') };
	}

	const { phone } = validatedFormData.data;
	const rawPhone = phone.replace(/\D/g, '');
	const requestHeaders = await headers();
	const ip = getClientIp(requestHeaders);

	const [phoneRate, ipRate] = await Promise.all([
		checkRateLimit({
			key: `auth:phone-otp:send:phone:${rawPhone}`,
			limit: PHONE_OTP_SEND_LIMIT_PER_PHONE,
			windowMs: PHONE_OTP_SEND_WINDOW_MS,
		}),
		checkRateLimit({
			key: `auth:phone-otp:send:ip:${ip}`,
			limit: PHONE_OTP_SEND_LIMIT_PER_IP,
			windowMs: PHONE_OTP_SEND_WINDOW_MS,
		}),
	]);

	if (!phoneRate.allowed || !ipRate.allowed) {
		return { success: false, message: validationT('tooManyRequests') };
	}

	try {
		await prisma.verification.deleteMany({
			where: {
				identifier: rawPhone,
			},
		});

		await auth.api.sendPhoneNumberOTP({
			body: {
				phoneNumber: rawPhone,
			},
		});

		return { success: true };
	} catch (error: any) {
		const errorMap: Record<string, string> = {
			'Too many requests': validationT('tooManyRequests'),
			'Unknown error': validationT('smsSendFailed'),
		};

		return {
			success: false,
			message: errorMap[error?.body?.message ?? ''] || validationT('smsSendFailed'),
		};
	}
}
