import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import type { I18nData } from '@/types/i18n';

export const phoneVerifySchemaShape = (t: { pinRequired: string; pinLength: string }) =>
	z.object({
		otp: z
			.array(z.string().min(1), { required_error: t.pinRequired })
			.length(6, { message: t.pinLength }),
	});

export const createPhoneVerifySchema = (t: I18nData) =>
	phoneVerifySchemaShape(t as Parameters<typeof phoneVerifySchemaShape>[0]);

export async function getPhoneVerifySchema() {
	const t = await getTranslations('validation');

	return phoneVerifySchemaShape({
		pinRequired: t('pinRequired'),
		pinLength: t('pinLength'),
	});
}

export type PhoneVerifySchema = z.infer<Awaited<ReturnType<typeof getPhoneVerifySchema>>>;
