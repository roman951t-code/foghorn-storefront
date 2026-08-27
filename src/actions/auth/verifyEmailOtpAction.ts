'use server';

import 'server-only';

import * as Sentry from '@sentry/nextjs';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
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
		const existingUserWithEmail = await prisma.user.findFirst({
			where: {
				email: normalizedEmail,
				id: { not: userId },
			},
			select: { id: true },
		});
		if (existingUserWithEmail) {
			return { success: false, message: validationT('userExists') };
		}

		await prisma.$transaction(async (tx) => {
			await tx.user.update({
				where: { id: userId },
				data: { email: normalizedEmail, emailVerified: true },
			});

			// Cleanup is best-effort and should not make successful verification fail.
			await tx.emailVerificationCode.deleteMany({
				where: {
					userId,
					email: normalizedEmail,
				},
			});
		});

		return { success: true };
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			if (error.code === 'P2002') {
				return { success: false, message: validationT('userExists') };
			}
			if (error.code === 'P2025') {
				return { success: false, message: validationT('userNotFound') };
			}
		}
		Sentry.captureException(error, { tags: { authAction: 'verify-email-otp' } });
		return { success: false, message: validationT('verificationFailed') };
	}
}
