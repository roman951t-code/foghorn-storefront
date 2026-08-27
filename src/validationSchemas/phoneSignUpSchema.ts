import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import type { I18nData } from '@/types/i18n';

const phoneSignUpSchemaShape = (t: {
	nameRequired: string;
	nameMinLength: string;
	phoneRequired: string;
	inputMaxLength: string;
	invalidPhone: string;
}) =>
	z.object({
		name: z
			.string({ message: t.nameRequired })
			.min(2, { message: t.nameMinLength })
			.max(60, { message: t.inputMaxLength })
			.nonempty(),

		phone: z
			.string({ message: t.phoneRequired })
			.transform((val) => val.replace(/\D/g, ''))
			.refine((val) => val.length === 12 && val.startsWith('380'), {
				message: t.invalidPhone,
			}),
	});

export const createPhoneSignUpSchema = (t: I18nData) =>
	phoneSignUpSchemaShape(t as Parameters<typeof phoneSignUpSchemaShape>[0]);

export async function getPhoneSignUpSchema() {
	const validationT = await getTranslations('validation');

	return phoneSignUpSchemaShape({
		phoneRequired: validationT('phoneRequired'),
		inputMaxLength: validationT('inputMaxLength'),
		invalidPhone: validationT('invalidPhone'),
		nameRequired: validationT('nameRequired'),
		nameMinLength: validationT('nameMinLength'),
	});
}

export type PhoneSignUpSchema = z.infer<Awaited<ReturnType<typeof getPhoneSignUpSchema>>>;
