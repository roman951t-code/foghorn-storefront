import type { I18nData } from '@/types/i18n';

export const PHONE_INPUT_MASKS = ['380-999-9999-99', '999-999-999'];

export const MAX_NAME_LENGTH = 60;

export const buildPhoneVerificationErrorMap = (i18nData: I18nData) => ({
	'OTP not found': i18nData.invalidOtp,
	'OTP expired': i18nData.otpExpired,
	'User not found': i18nData.userNotFound,
	'Too many attempts': i18nData.tooManyAttempts,
});
