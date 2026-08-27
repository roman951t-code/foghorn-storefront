'use server';

import 'server-only';

import * as Sentry from '@sentry/nextjs';
import { getTranslations } from 'next-intl/server';
import { getResetPassSchema } from 'validationSchemas/resetPassSchema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { getActionErrorMessageKey } from './authActionError';

const RESET_PASSWORD_LIMIT_PER_EMAIL = 3;
const RESET_PASSWORD_LIMIT_PER_IP = 20;
const RESET_PASSWORD_WINDOW_MS = 10 * 60 * 1000;

export async function resetPasswordAction(
	_: unknown,
	formData: unknown
): Promise<{ success: boolean; message?: string } | undefined> {
	const validationT = await getTranslations('validation');

	const schema = await getResetPassSchema();
	const validatedFormData = schema.safeParse(formData);

	if (!validatedFormData.success) {
		return { success: false, message: validationT('invalidFormData') };
	}

	const normalizedEmail = validatedFormData.data.email.trim().toLowerCase();
	const requestHeaders = await headers();
	const ip = getClientIp(requestHeaders);

	const [emailRate, ipRate] = await Promise.all([
		checkRateLimit({
			key: `auth:password-reset:email:${normalizedEmail}`,
			limit: RESET_PASSWORD_LIMIT_PER_EMAIL,
			windowMs: RESET_PASSWORD_WINDOW_MS,
		}),
		checkRateLimit({
			key: `auth:password-reset:ip:${ip}`,
			limit: RESET_PASSWORD_LIMIT_PER_IP,
			windowMs: RESET_PASSWORD_WINDOW_MS,
		}),
	]);

	if (!emailRate.allowed || !ipRate.allowed) {
		return { success: false, message: validationT('tooManyRequests') };
	}

	try {
		await auth.api.forgetPasswordEmailOTP({
			body: {
				email: normalizedEmail,
			},
		});

		return { success: true };
	} catch (error: unknown) {
		const messageKey = getActionErrorMessageKey(error);
		const errorMap: Record<string, string> = {
			'Invalid email': validationT('wrongEmail'),
			'Missing email': validationT('emailRequired'),
			'Too many requests': validationT('tooManyRequests'),
			'Unknown error': validationT('setNewPassFail'),
		};

		if (!errorMap[messageKey]) {
			Sentry.captureException(error, { tags: { authAction: 'reset-password' } });
		}

		return {
			success: false,
			message: errorMap[messageKey] || validationT('setNewPassFail'),
		};
	}
}
