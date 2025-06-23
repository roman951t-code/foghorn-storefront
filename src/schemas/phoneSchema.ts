import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import type { I18nData } from '@/types/i18n';

const phoneRegex = /^\(\+38 0\) \d{9}$/;

export const phoneSchemaShape = (t: { phoneRequired: string; invalidPhone: string }) =>
	z.object({
		phone: z
			.string({ required_error: t.phoneRequired })
			.regex(phoneRegex, { message: t.invalidPhone }),
	});

export const createPhoneSchema = (t: I18nData) =>
	phoneSchemaShape(t as Parameters<typeof phoneSchemaShape>[0]);

export async function getPhoneSchema() {
	const t = await getTranslations('Validation');

	return phoneSchemaShape({
		phoneRequired: t('phoneRequired'),
		invalidPhone: t('invalidPhone'),
	});
}

export type PhoneSchema = z.infer<Awaited<ReturnType<typeof getPhoneSchema>>>;
