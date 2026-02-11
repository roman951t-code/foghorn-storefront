'use server';

import 'server-only';

import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { getPhoneSignInSchema } from 'validationSchemas/phoneSignInSchema';
import { autoVerifyPhoneNumber } from './phoneVerificationHelper';
import { headers } from 'next/headers';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

const PHONE_SIGN_IN_LIMIT_PER_PHONE = 8;
const PHONE_SIGN_IN_LIMIT_PER_IP = 30;
const PHONE_SIGN_IN_WINDOW_MS = 10 * 60 * 1000;

export async function phoneSignInAction(
	_: unknown,
	formData: unknown
): Promise<{ success: boolean; message?: string } | undefined> {
	const validationT = await getTranslations('validation');
	const schema = await getPhoneSignInSchema();
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
			key: `auth:phone-signin:phone:${rawPhone}`,
			limit: PHONE_SIGN_IN_LIMIT_PER_PHONE,
			windowMs: PHONE_SIGN_IN_WINDOW_MS,
		}),
		checkRateLimit({
			key: `auth:phone-signin:ip:${ip}`,
			limit: PHONE_SIGN_IN_LIMIT_PER_IP,
			windowMs: PHONE_SIGN_IN_WINDOW_MS,
		}),
	]);

	if (!phoneRate.allowed || !ipRate.allowed) {
		return { success: false, message: validationT('tooManyRequests') };
	}

	const existingUser = await prisma.user.findUnique({
		where: { phoneNumber: rawPhone },
		select: { id: true },
	});

	if (!existingUser) {
		return { success: false, message: validationT('userLoginFail') };
	}

	try {
		await autoVerifyPhoneNumber({
			phoneNumber: rawPhone,
			disableSession: false,
			updatePhoneNumber: false,
		});

		return { success: true };
	} catch (error: any) {
		const messageKey = error?.body?.message ?? error?.message ?? '';
		const errorMap: Record<string, string> = {
			'Too many requests': validationT('tooManyRequests'),
			'Unknown error': validationT('smsSendFailed'),
		};

		return {
			success: false,
			message: errorMap[messageKey] || validationT('userLoginFail'),
		};
	}
}
