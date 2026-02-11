'use server';

import 'server-only';

import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { getPhoneSignUpSchema } from 'validationSchemas/phoneSignUpSchema';
import { autoVerifyPhoneNumber } from './phoneVerificationHelper';
import { headers } from 'next/headers';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

const PHONE_SIGN_UP_LIMIT_PER_PHONE = 6;
const PHONE_SIGN_UP_LIMIT_PER_IP = 20;
const PHONE_SIGN_UP_WINDOW_MS = 10 * 60 * 1000;

export async function phoneSignUpAction(
	_: unknown,
	formData: unknown
): Promise<{ success: boolean; message?: string } | undefined> {
	const validationT = await getTranslations('validation');
	const schema = await getPhoneSignUpSchema();
	const validated = schema.safeParse(formData);

	if (!validated.success) {
		return { success: false, message: validationT('invalidFormData') };
	}

	const { phone, name } = validated.data;
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
		const verificationResult = await autoVerifyPhoneNumber({
			phoneNumber: rawPhone,
			disableSession: false,
			updatePhoneNumber: false,
		});

		// Ensure the user's profile is up to date after auto-verification.
		if (verificationResult?.user?.id) {
			await prisma.user.update({
				where: { id: verificationResult.user.id },
				data: {
					name,
					notificationMethod: 'phone',
					phoneNumberVerified: true,
				},
			});
		}

		return { success: true };
	} catch (error: any) {
		const messageKey = error?.body?.message ?? error?.message ?? '';
		const errorMap: Record<string, string> = {
			'Phone number already exists': validationT('userRegisterFail'),
			'Too many requests': validationT('tooManyRequests'),
			'OTP not found': validationT('userRegisterFail'),
		};

		return {
			success: false,
			message: errorMap[messageKey] || validationT('userRegisterFail'),
		};
	}
}
