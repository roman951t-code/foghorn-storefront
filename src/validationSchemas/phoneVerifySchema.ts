import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import type { I18nData } from '@/types/i18n';

export const phoneVerifySchemaShape = (t: { pinRequired: string; pinLength: string }) =>
	z.object({
		otp: z
			.array(z.string().min(1), { message: t.pinRequired })
			.length(6, { message: t.pinLength }),
	});

export const createPhoneVerifySchema = (t: I18nData) =>
	phoneVerifySchemaShape(t as Parameters<typeof phoneVerifySchemaShape>[0]);

export async function getPhoneVerifySchema() {
	const validationT = await getTranslations('validation');

	return phoneVerifySchemaShape({
		pinRequired: validationT('pinRequired'),
		pinLength: validationT('pinLength'),
	});
}

export type PhoneVerifySchema = z.infer<Awaited<ReturnType<typeof getPhoneVerifySchema>>>;
