import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import type { I18nData } from '@/types/i18n';

export const emailSchemaShape = (t: {
	emailRequired: string;
	emailMaxLength: string;
	wrongEmail: string;
	passwordRequired: string;
	passwordMin: string;
	passwordMax: string;
	passwordUppercase: string;
	passwordLowercase: string;
	passwordAlphabetic: string;
	passwordUnderscore: string;
}) =>
	z.object({
		email: z
			.string({ required_error: t.emailRequired })
			.max(60, { message: t.emailMaxLength })
			.email({ message: t.wrongEmail }),

		password: z
			.string({ required_error: t.passwordRequired })
			.min(8, { message: t.passwordMin })
			.max(12, { message: t.passwordMax })
			.regex(/[A-Z]/, { message: t.passwordUppercase })
			.regex(/[a-z]/, { message: t.passwordLowercase })
			.regex(/[a-zA-Z]/, { message: t.passwordAlphabetic })
			.regex(/_/, { message: t.passwordUnderscore }),
	});

export const createEmailSchema = (t: I18nData) =>
	emailSchemaShape(t as Parameters<typeof emailSchemaShape>[0]);

export async function getEmailSchema() {
	const t = await getTranslations('Validation');

	return emailSchemaShape({
		emailRequired: t('emailRequired'),
		emailMaxLength: t('emailMaxLength'),
		wrongEmail: t('wrongEmail'),
		passwordRequired: t('passwordRequired'),
		passwordMin: t('passwordMin'),
		passwordMax: t('passwordMax'),
		passwordUppercase: t('passwordUppercase'),
		passwordLowercase: t('passwordLowercase'),
		passwordAlphabetic: t('passwordAlphabetic'),
		passwordUnderscore: t('passwordUnderscore'),
	});
}

export type EmailSchema = z.infer<Awaited<ReturnType<typeof getEmailSchema>>>;
