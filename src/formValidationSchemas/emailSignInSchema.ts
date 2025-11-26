import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import type { I18nData } from '@/types/i18n';

export const emailSignInSchemaShape = (t: {
	emailRequired: string;
	inputMaxLength: string;
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
			.string({ message: t.emailRequired })
			.max(60, { message: t.inputMaxLength })
			.email({ message: t.wrongEmail }),

		password: z
			.string({ message: t.passwordRequired })
			.min(8, { message: t.passwordMin })
			.max(12, { message: t.passwordMax })
			.regex(/[A-Z]/, { message: t.passwordUppercase })
			.regex(/[a-z]/, { message: t.passwordLowercase })
			.regex(/[a-zA-Z]/, { message: t.passwordAlphabetic })
			.regex(/_/, { message: t.passwordUnderscore }),
	});

export const createEmailSignInSchema = (t: I18nData) =>
	emailSignInSchemaShape(t as Parameters<typeof emailSignInSchemaShape>[0]);

export async function getEmailSignInSchema() {
	const t = await getTranslations('validation');

	return emailSignInSchemaShape({
		emailRequired: t('emailRequired'),
		inputMaxLength: t('inputMaxLength'),
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

export type EmailSchema = z.infer<Awaited<ReturnType<typeof getEmailSignInSchema>>>;
