'use server';

import 'server-only';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import { checkRateLimit } from '@/lib/rateLimit';
import {
	isOtpFormatValid,
	normalizeEmailForOtp,
	normalizeOtpInput,
	verifyStoredOtpCode,
} from '@/lib/otp';

const OTP_VERIFY_LIMIT = 6;
const OTP_VERIFY_WINDOW_MS = 10 * 60 * 1000;

export async function verifyEmailOtpAction(email: string, code: string) {
	const validationT = await getTranslations('validation');

	const session = await auth.api.getSession({
		headers: await headers(),
	});
	const userId = session?.user?.id;
	if (!userId) {
		return { success: false, message: validationT('userNotFound') };
	}

	const normalizedEmail = normalizeEmailForOtp(email);
	const normalizedCode = normalizeOtpInput(code);
	if (!isOtpFormatValid(normalizedCode)) {
		return { success: false, message: validationT('invalidOtp') };
	}

	const verifyRate = await checkRateLimit({
		key: `auth:email-verify:verify:${userId}:${normalizedEmail}`,
		limit: OTP_VERIFY_LIMIT,
		windowMs: OTP_VERIFY_WINDOW_MS,
	});

	if (!verifyRate.allowed) {
		return { success: false, message: validationT('tooManyAttempts') };
	}

	const record = await prisma.emailVerificationCode.findFirst({
		where: {
			userId,
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
		scope: 'email-verification',
		identifier: `${userId}:${normalizedEmail}`,
	});

	if (!isCodeValid) {
		return { success: false, message: validationT('invalidOtp') };
	}

	try {
		await prisma.user.update({
			where: { id: userId },
			data: { email: normalizedEmail, emailVerified: true },
		});

		await prisma.emailVerificationCode.delete({ where: { id: record.id } });

		return { success: true };
	} catch {
		return { success: false, message: validationT('verificationFailed') };
	}
}
