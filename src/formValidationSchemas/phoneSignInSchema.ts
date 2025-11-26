import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import type { I18nData } from '@/types/i18n';

export const phoneSignInSchemaShape = (t: { phoneRequired: string; invalidPhone: string }) =>
	z.object({
		phone: z
			.string({ message: t.phoneRequired })
			.transform((val) => val.replace(/\D/g, ''))
			.refine((val) => val.length === 12 && val.startsWith('380'), {
				message: t.invalidPhone,
			}),
	});

export const createPhoneSignInSchema = (t: I18nData) =>
	phoneSignInSchemaShape(t as Parameters<typeof phoneSignInSchemaShape>[0]);

export async function getPhoneSignInSchema() {
	const t = await getTranslations('validation');

	return phoneSignInSchemaShape({
		phoneRequired: t('phoneRequired'),
		invalidPhone: t('invalidPhone'),
	});
}

export type PhoneSignInSchema = z.infer<Awaited<ReturnType<typeof getPhoneSignInSchema>>>;
