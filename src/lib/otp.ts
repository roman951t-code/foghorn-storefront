import crypto from 'node:crypto';
import { env } from '@/config/env';

type OtpScope = 'email-verification' | 'email-registration';

const OTP_REGEX = /^\d{6}$/;
const otpHashSecret = env.ENCRYPTION_KEY;

if (!otpHashSecret) {
	throw new Error('ENCRYPTION_KEY is required for OTP hashing');
}
const OTP_HASH_SECRET: string = otpHashSecret;

function safeEqual(a: string, b: string): boolean {
	const aBuffer = Buffer.from(a, 'utf8');
	const bBuffer = Buffer.from(b, 'utf8');
	if (aBuffer.length !== bBuffer.length) return false;
	return crypto.timingSafeEqual(aBuffer, bBuffer);
}

export function normalizeEmailForOtp(email: string): string {
	return email.trim().toLowerCase();
}

export function normalizeOtpInput(code: string): string {
	return code.trim();
}

export function isOtpFormatValid(code: string): boolean {
	return OTP_REGEX.test(code);
}

export function generateOtpCode(): string {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

export function hashOtpCode({
	otp,
	scope,
	identifier,
}: {
	otp: string;
	scope: OtpScope;
	identifier: string;
}): string {
	return crypto
		.createHmac('sha256', OTP_HASH_SECRET)
		.update(`${scope}:${identifier}:${normalizeOtpInput(otp)}`)
		.digest('hex');
}

export function verifyStoredOtpCode({
	otp,
	storedCode,
	scope,
	identifier,
}: {
	otp: string;
	storedCode: string;
	scope: OtpScope;
	identifier: string;
}): boolean {
	const normalizedOtp = normalizeOtpInput(otp);
	if (!isOtpFormatValid(normalizedOtp)) return false;

	// Backward-compatible rollout path for previously stored plaintext OTP values.
	if (isOtpFormatValid(storedCode)) {
		return safeEqual(storedCode, normalizedOtp);
	}

	const expectedHash = hashOtpCode({
		otp: normalizedOtp,
		scope,
		identifier,
	});
	return safeEqual(storedCode, expectedHash);
}
