'use server';

import 'server-only';

import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { checkRateLimit } from '@/lib/rateLimit';
import {
	isOtpFormatValid,
	normalizeEmailForOtp,
	normalizeOtpInput,
	verifyStoredOtpCode,
} from '@/lib/otp';

const OTP_VERIFY_LIMIT = 6;
const OTP_VERIFY_WINDOW_MS = 10 * 60 * 1000;

export async function verifyEmailRegisterOtpAction(email: string, code: string) {
	const validationT = await getTranslations('validation');
	const normalizedEmail = normalizeEmailForOtp(email);
	const normalizedCode = normalizeOtpInput(code);

	if (!isOtpFormatValid(normalizedCode)) {
		return { success: false, message: validationT('invalidOtp') };
	}

	const verifyRate = await checkRateLimit({
		key: `auth:email-register:verify:${normalizedEmail}`,
		limit: OTP_VERIFY_LIMIT,
		windowMs: OTP_VERIFY_WINDOW_MS,
	});

	if (!verifyRate.allowed) {
		return { success: false, message: validationT('tooManyAttempts') };
	}

	const record = await prisma.emailRegistrationCode.findFirst({
		where: {
			email: normalizedEmail,
			expiresAt: { gt: new Date() },
		},
		orderBy: { createdAt: 'desc' },
	});

	if (!record) {
		return { success: false, message: validationT('otpExpired') };
	}

	const isCodeValid = verifyStoredOtpCode({
		otp: normalizedCode,
		storedCode: record.code,
		scope: 'email-registration',
		identifier: normalizedEmail,
	});

	if (!isCodeValid) {
		return { success: false, message: validationT('invalidOtp') };
	}

	try {
		const user = await prisma.user.findUnique({
			where: { email: record.email },
			select: { id: true },
		});

		if (!user) {
			return { success: false, message: validationT('userRegisterFail') };
		}

		await prisma.user.update({
			where: { id: user.id },
			data: {
				emailVerified: true,
				notificationMethod: 'email',
			},
		});

		await prisma.emailRegistrationCode.delete({ where: { id: record.id } });

		return { success: true };
	} catch {
		return { success: false, message: validationT('userRegisterFail') };
	}
}
