import { env } from '@/config/env';

const FALLBACK_CURRENCY = 'USD';

const normalizeCurrencyCode = (value: string | null | undefined) => {
	const trimmed = (value ?? '').trim();
	if (!trimmed) return FALLBACK_CURRENCY;
	return trimmed.toUpperCase();
};

export const STORE_CURRENCY_CODE = normalizeCurrencyCode(env.STRIPE_CURRENCY);
export const STORE_CURRENCY_CODE_LOWER = STORE_CURRENCY_CODE.toLowerCase();
