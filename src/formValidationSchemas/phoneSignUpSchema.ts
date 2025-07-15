import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import type { I18nData } from '@/types/i18n';

export const phoneSignUpSchemaShape = (t: {
	nameRequired: string;
	nameMinLength: string;
	phoneRequired: string;
	inputMaxLength: string;
	invalidPhone: string;
}) =>
	z.object({
		firstName: z
			.string({ required_error: t.nameRequired })
			.min(2, { message: t.nameMinLength })
			.max(60, { message: t.inputMaxLength })
			.nonempty(),

		phone: z
			.string({ required_error: t.phoneRequired })
			.transform((val) => val.replace(/\D/g, ''))
			.refine((val) => val.length === 12 && val.startsWith('380'), {
				message: t.invalidPhone,
			}),
	});

export const createPhoneSignUpSchema = (t: I18nData) =>
	phoneSignUpSchemaShape(t as Parameters<typeof phoneSignUpSchemaShape>[0]);

export async function getPhoneSignUpSchema() {
	const t = await getTranslations('Validation');

	return phoneSignUpSchemaShape({
		phoneRequired: t('phoneRequired'),
		inputMaxLength: t('inputMaxLength'),
		invalidPhone: t('invalidPhone'),
		nameRequired: t('nameRequired'),
		nameMinLength: t('nameMinLength'),
	});
}

export type phoneSignUpSchema = z.infer<Awaited<ReturnType<typeof getPhoneSignUpSchema>>>;
