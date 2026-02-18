import type { I18nData } from '@/types/i18n';

export const PHONE_INPUT_MASKS = ['380-999-9999-99', '999-999-999'];

export const MAX_NAME_LENGTH = 60;

const normalizeAuthErrorKey = (value: string) =>
	value
		.trim()
		.toLowerCase()
		.replace(/['"`]/g, '')
		.replace(/[^a-z0-9]+/g, '_')
		.replace(/^_+|_+$/g, '');

const buildAuthErrorMap = (entries: Record<string, string>) =>
	Object.entries(entries).reduce<Record<string, string>>((acc, [key, message]) => {
		acc[key] = message;
		acc[normalizeAuthErrorKey(key)] = message;
		return acc;
	}, {});

export const resolveAuthErrorMessage = ({
	errorKey,
	errorMap,
	fallback,
}: {
	errorKey?: string | null;
	errorMap: Record<string, string>;
	fallback: string;
}) => {
	if (!errorKey) return fallback;
	const normalizedKey = normalizeAuthErrorKey(errorKey);
	return errorMap[errorKey] || errorMap[normalizedKey] || fallback;
};

export const buildEmailSignInErrorMap = (i18nData: I18nData) =>
	buildAuthErrorMap({
		'Invalid password': i18nData.userLoginFail,
		'Invalid credentials': i18nData.userLoginFail,
		'Invalid email or password': i18nData.userLoginFail,
		'User not found': i18nData.userLoginFail,
		'Email not verified': i18nData.emailNotVerified,
		'Too many attempts': i18nData.tooManyAttempts,
		'Too many requests': i18nData.tooManyAttempts,
	});

export const buildPhoneVerificationErrorMap = (i18nData: I18nData) =>
	buildAuthErrorMap({
		'OTP not found': i18nData.invalidOtp,
		'Invalid OTP': i18nData.invalidOtp,
		'OTP expired': i18nData.otpExpired,
		'User not found': i18nData.userNotFound,
		'Too many attempts': i18nData.tooManyAttempts,
		'Too many requests': i18nData.tooManyAttempts,
	});

export const buildResetPasswordVerificationErrorMap = (i18nData: I18nData) =>
	buildAuthErrorMap({
		'OTP not found': i18nData.invalidOtp,
		'Invalid OTP': i18nData.invalidOtp,
		'OTP expired': i18nData.otpExpired,
		'User not found': i18nData.userNotFound,
		'Too many attempts': i18nData.tooManyAttempts,
		'Too many requests': i18nData.tooManyAttempts,
		'Password reset code has expired': i18nData.refreshTokenError,
	});

export const buildEmailChangeErrorMap = (i18nData: I18nData) =>
	buildAuthErrorMap({
		'Invalid password': i18nData.invalidFormData,
		'User not found': i18nData.userNotFound,
		'Too many attempts': i18nData.tooManyAttempts,
		'Too many requests': i18nData.tooManyAttempts,
	});
