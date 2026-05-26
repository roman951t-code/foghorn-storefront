import 'server-only';

import { env } from '@/config/env';
import { prisma } from '@/lib/prisma';

const TWILIO_API_BASE = 'https://api.twilio.com/2010-04-01/Accounts';
const TWILIO_OTP_TEMPLATE = 'Your verification code is {{code}}.';
const STORED_PHONE_OTP_REGEX = /^(\d{6}):\d+$/;

const normalizeOptional = (value: string | undefined) => {
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
};

const toE164PhoneNumber = (rawPhoneNumber: string) => {
	const trimmed = rawPhoneNumber.trim();
	if (!trimmed) return null;

	const digits = trimmed.replace(/\D/g, '');
	if (!digits) return null;
	if (digits.length < 8 || digits.length > 15) return null;

	return `+${digits}`;
};

const resolveTwilioConfig = () => {
	const accountSid = normalizeOptional(process.env.TWILIO_ACCOUNT_SID);
	const authToken = normalizeOptional(process.env.TWILIO_AUTH_TOKEN);
	const fromPhone = normalizeOptional(process.env.TWILIO_FROM_PHONE);
	return {
		accountSid,
		authToken,
		fromPhone,
		isConfigured: Boolean(accountSid && authToken && fromPhone),
	};
};

const isPhoneOtpTestAutofillEnabled = () =>
	env.NODE_ENV !== 'production' && !resolveTwilioConfig().isConfigured;

const extractStoredPhoneOtpCode = (storedValue: string | null | undefined) => {
	if (typeof storedValue !== 'string') return null;

	const match = storedValue.match(STORED_PHONE_OTP_REGEX);
	return match?.[1] ?? null;
};

const buildTwilioBasicAuthHeader = (accountSid: string, authToken: string) =>
	`Basic ${Buffer.from(`${accountSid}:${authToken}`, 'utf8').toString('base64')}`;

export async function getPhoneOtpCodeForTesting(phoneNumber: string): Promise<string | undefined> {
	if (!isPhoneOtpTestAutofillEnabled()) return undefined;

	const verification = await prisma.verification.findFirst({
		where: { identifier: phoneNumber },
		orderBy: { expiresAt: 'desc' },
		select: { value: true },
	});

	return extractStoredPhoneOtpCode(verification?.value) ?? undefined;
}

export async function sendPhoneOtpCode({
	phoneNumber,
	code,
}: {
	phoneNumber: string;
	code: string;
}): Promise<void> {
	const normalizedToPhone = toE164PhoneNumber(phoneNumber);
	if (!normalizedToPhone) {
		throw new Error('invalid_phone_number');
	}

	const twilioConfig = resolveTwilioConfig();
	if (twilioConfig.isConfigured) {
		const body = new URLSearchParams({
			To: normalizedToPhone,
			From: twilioConfig.fromPhone!,
			Body: TWILIO_OTP_TEMPLATE.replace('{{code}}', code),
		});

		const response = await fetch(`${TWILIO_API_BASE}/${twilioConfig.accountSid}/Messages.json`, {
			method: 'POST',
			headers: {
				Authorization: buildTwilioBasicAuthHeader(
					twilioConfig.accountSid!,
					twilioConfig.authToken!,
				),
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body,
			cache: 'no-store',
		});

		if (!response.ok) {
			const details = await response.text().catch(() => '');
			const truncatedDetails = details.slice(0, 240);
			throw new Error(
				`sms_provider_send_failed:${response.status}${truncatedDetails ? `:${truncatedDetails}` : ''}`,
			);
		}
		return;
	}

	if (env.NODE_ENV !== 'production') {
		console.info('[auth][phone-otp][dev-only]', {
			phoneNumber: normalizedToPhone,
			code,
		});
		return;
	}

	throw new Error('phone_otp_provider_not_configured');
}
