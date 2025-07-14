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
	addressRequired: string;
	addressMax: string;
	notificationRequired: string;
}) => ({
	name: z.string({ required_error: t.nameRequired }).max(60, { message: t.nameMax }),

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

	shipmentAddress: z
		.string({ required_error: t.addressRequired })
		.max(200, { message: t.addressMax }),

	notificationMethod: z
		.string({ required_error: t.notificationRequired })
		.refine((val) => val === 'email' || val === 'phone', {
			message: t.notificationRequired,
		}),
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
		addressRequired: t('addressRequired'),
		addressMax: t('inputMaxLength'),
		notificationRequired: t('notificationRequired'),
	});

	return {
		nameSchema: z.object({ name: shape.name }),
		emailSchema: z.object({ email: shape.email }),
		phoneSchema: z.object({ phone: shape.phone }),
		addressSchema: z.object({ shipmentAddress: shape.shipmentAddress }),
		notificationSchema: z.object({ notificationMethod: shape.notificationMethod }),
	};
}

export type AccountSchemas = Awaited<ReturnType<typeof getAccountSchemas>>;
