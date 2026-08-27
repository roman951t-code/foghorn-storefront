'use server';

import 'server-only';

import * as Sentry from '@sentry/nextjs';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { getPhoneSignUpSchema } from 'validationSchemas/phoneSignUpSchema';
import { headers } from 'next/headers';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { auth } from '@/lib/auth';
import { getPhoneOtpCodeForTesting } from '@/lib/phoneOtp';
import { getActionErrorMessageKey } from './authActionError';

const PHONE_SIGN_UP_LIMIT_PER_PHONE = 6;
const PHONE_SIGN_UP_LIMIT_PER_IP = 20;
const PHONE_SIGN_UP_WINDOW_MS = 10 * 60 * 1000;

export async function phoneSignUpAction(
	_: unknown,
	formData: unknown
): Promise<{ success: boolean; message?: string; devOtp?: string } | undefined> {
	const validationT = await getTranslations('validation');
	const schema = await getPhoneSignUpSchema();
	const validated = schema.safeParse(formData);

	if (!validated.success) {
		return { success: false, message: validationT('invalidFormData') };
	}

	const { phone } = validated.data;
	const rawPhone = phone.replace(/\D/g, '');
	const requestHeaders = await headers();
	const ip = getClientIp(requestHeaders);

	const [phoneRate, ipRate] = await Promise.all([
		checkRateLimit({
			key: `auth:phone-signup:phone:${rawPhone}`,
			limit: PHONE_SIGN_UP_LIMIT_PER_PHONE,
			windowMs: PHONE_SIGN_UP_WINDOW_MS,
		}),
		checkRateLimit({
			key: `auth:phone-signup:ip:${ip}`,
			limit: PHONE_SIGN_UP_LIMIT_PER_IP,
			windowMs: PHONE_SIGN_UP_WINDOW_MS,
		}),
	]);

	if (!phoneRate.allowed || !ipRate.allowed) {
		return { success: false, message: validationT('tooManyRequests') };
	}

	try {
		const existingUser = await prisma.user.findUnique({
			where: { phoneNumber: rawPhone },
			select: { id: true },
		});
		if (existingUser) {
			return { success: false, message: validationT('userExists') };
		}

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

		return {
			success: true,
			devOtp: await getPhoneOtpCodeForTesting(rawPhone),
		};
	} catch (error: unknown) {
		const messageKey = getActionErrorMessageKey(error);
		const errorMap: Record<string, string> = {
			'Phone number already exists': validationT('userExists'),
			'Too many requests': validationT('tooManyRequests'),
			phone_otp_provider_not_configured: validationT('smsSendFailed'),
			'Unknown error': validationT('smsSendFailed'),
		};

		if (!errorMap[messageKey]) {
			Sentry.captureException(error, { tags: { authAction: 'phone-sign-up' } });
		}

		return {
			success: false,
			message: errorMap[messageKey] || validationT('userRegisterFail'),
		};
	}
}
