import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import { I18nData } from '@/types/i18n';

export const accountSchemaShape = (t: {
	nameRequired: string;
	nameMax: string;
	emailRequired: string;
	inputMaxLength: string;
	wrongEmail: string;
	phoneRequired: string;
	invalidPhone: string;
	addressMax: string;
	nameMinLength: string;
	middleNameRequired: string;
	lastNameRequired: string;
}) => ({
	name: z
		.string({ required_error: t.nameRequired })
		.min(2, { message: t.nameMinLength })
		.max(60, { message: t.inputMaxLength })
		.nonempty(),
	middleName: z
		.string({ required_error: t.middleNameRequired })
		.min(2, { message: t.nameMinLength })
		.max(60, { message: t.inputMaxLength })
		.nonempty(),
	lastName: z
		.string({ required_error: t.lastNameRequired })
		.min(2, { message: t.nameMinLength })
		.max(60, { message: t.inputMaxLength })
		.nonempty(),
	email: z
		.string({ required_error: t.emailRequired })
		.max(60, { message: t.inputMaxLength })
		.email({ message: t.wrongEmail }),

	phone: z
		.string({ required_error: t.phoneRequired })
		.transform((val) => val.replace(/\D/g, ''))
		.refine((val) => val.length === 12 && val.startsWith('380'), {
			message: t.invalidPhone,
		}),

	shipmentAddress: z.string().max(200, { message: t.addressMax }),
});

export const createAccountSchema = (t: I18nData) =>
	accountSchemaShape(t as Parameters<typeof accountSchemaShape>[0]);

export async function getAccountSchemas() {
	const t = await getTranslations('Validation');

	const shape = accountSchemaShape({
		nameRequired: t('nameRequired'),
		nameMax: t('inputMaxLength'),
		emailRequired: t('emailRequired'),
		inputMaxLength: t('inputMaxLength'),
		wrongEmail: t('wrongEmail'),
		phoneRequired: t('phoneRequired'),
		invalidPhone: t('invalidPhone'),
		addressMax: t('inputMaxLength'),
		nameMinLength: t('nameMinLength'),
		middleNameRequired: t('middleNameRequired'),
		lastNameRequired: t('lastNameRequired'),
	});

	return {
		nameSchema: z.object({
			name: shape.name,
			lastName: shape.lastName,
			middleName: shape.middleName,
			email: shape.email,
		}),
		emailSchema: z.object({ email: shape.email }),
		phoneSchema: z.object({ phone: shape.phone, email: shape.email }),
		addressSchema: z.object({ shipmentAddress: shape.shipmentAddress, email: shape.email }),
	};
}

export type AccountSchemas = Awaited<ReturnType<typeof getAccountSchemas>>;
