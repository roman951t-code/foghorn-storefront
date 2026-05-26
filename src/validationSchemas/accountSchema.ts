import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import { I18nData } from '@/types/i18n';

const accountSchemaShape = (t: {
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
		.string({ message: t.nameRequired })
		.min(2, { message: t.nameMinLength })
		.max(60, { message: t.inputMaxLength })
		.nonempty(),
	middleName: z
		.string({ message: t.middleNameRequired })
		.min(2, { message: t.nameMinLength })
		.max(60, { message: t.inputMaxLength })
		.nonempty(),
	lastName: z
		.string({ message: t.lastNameRequired })
		.min(2, { message: t.nameMinLength })
		.max(60, { message: t.inputMaxLength })
		.nonempty(),
	email: z
		.string({ message: t.emailRequired })
		.max(60, { message: t.inputMaxLength })
		.email({ message: t.wrongEmail }),
	phone: z
		.string({ message: t.phoneRequired })
		.transform((val) => val.replace(/\D/g, ''))
		.refine((val) => val.length === 12 && val.startsWith('380'), {
			message: t.invalidPhone,
		}),
	shipmentAddress: z.string().max(200, { message: t.addressMax }),
});

const createAccountSchema = (t: I18nData) =>
	accountSchemaShape(t as Parameters<typeof accountSchemaShape>[0]);

const createNameSchemaFromShape = (shape: ReturnType<typeof accountSchemaShape>) =>
	z.object({
		name: shape.name,
		lastName: shape.lastName,
		middleName: shape.middleName,
	});

const createPhoneSchemaFromShape = (shape: ReturnType<typeof accountSchemaShape>) =>
	z.object({ phone: shape.phone });

export const createNameSchema = (t: I18nData) => createNameSchemaFromShape(createAccountSchema(t));

export const createPhoneSchema = (t: I18nData) =>
	createPhoneSchemaFromShape(createAccountSchema(t));

export async function getAccountSchemas() {
	const validationT = await getTranslations('validation');

	const shape = accountSchemaShape({
		nameRequired: validationT('nameRequired'),
		nameMax: validationT('inputMaxLength'),
		emailRequired: validationT('emailRequired'),
		inputMaxLength: validationT('inputMaxLength'),
		wrongEmail: validationT('wrongEmail'),
		phoneRequired: validationT('phoneRequired'),
		invalidPhone: validationT('invalidPhone'),
		addressMax: validationT('inputMaxLength'),
		nameMinLength: validationT('nameMinLength'),
		middleNameRequired: validationT('middleNameRequired'),
		lastNameRequired: validationT('lastNameRequired'),
	});

	return {
		nameSchema: createNameSchemaFromShape(shape),
		emailSchema: z.object({ email: shape.email }),
		phoneSchema: createPhoneSchemaFromShape(shape),
		addressSchema: z.object({ shipmentAddress: shape.shipmentAddress }),
	};
}

export type AccountSchemas = Awaited<ReturnType<typeof getAccountSchemas>>;

export type NameSchemaData = z.infer<Awaited<ReturnType<typeof getAccountSchemas>>['nameSchema']>;
export type PhoneSchemaData = z.infer<Awaited<ReturnType<typeof getAccountSchemas>>['phoneSchema']>;

export type EditNameActionPayload = NameSchemaData & { email: string };
