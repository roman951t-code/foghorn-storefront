import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import type { I18nData } from '@/types/i18n';

export const emailSignUpSchemaShape = (t: {
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
	passwordsNotMatch: string;
	firstNameRequired: string;
	nameMinLength: string;
}) =>
	z
		.object({
			name: z
				.string({ required_error: t.firstNameRequired })
				.min(2, { message: t.nameMinLength })
				.max(60, { message: t.inputMaxLength })
				.nonempty(),
			email: z
				.string({ required_error: t.emailRequired })
				.max(60, { message: t.inputMaxLength })
				.email({ message: t.wrongEmail }),

			password: z
				.string({ required_error: t.passwordRequired })
				.min(8, { message: t.passwordMin })
				.max(12, { message: t.passwordMax })
				.regex(/[A-Z]/, { message: t.passwordUppercase })
				.regex(/[a-z]/, { message: t.passwordLowercase })
				.regex(/[a-zA-Z]/, { message: t.passwordAlphabetic })
				.regex(/_/, { message: t.passwordUnderscore }),
			confirmPassword: z
				.string({ required_error: t.passwordRequired })
				.min(8, { message: t.passwordMin })
				.max(12, { message: t.passwordMax })
				.regex(/[A-Z]/, { message: t.passwordUppercase })
				.regex(/[a-z]/, { message: t.passwordLowercase })
				.regex(/[a-zA-Z]/, { message: t.passwordAlphabetic })
				.regex(/_/, { message: t.passwordUnderscore }),
		})
		.superRefine(({ password, confirmPassword }, ctx) => {
			if (password !== confirmPassword) {
				ctx.addIssue({
					code: 'custom',
					message: t.passwordsNotMatch,
					path: ['confirmPassword'],
				});
			}
		});

export const createEmailSignUpSchema = (t: I18nData) =>
	emailSignUpSchemaShape(t as Parameters<typeof emailSignUpSchemaShape>[0]);

export async function getEmailSignUpSchema() {
	const t = await getTranslations('Validation');

	return emailSignUpSchemaShape({
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
		passwordsNotMatch: t('passwordsNotMatch'),
		firstNameRequired: t('firstNameRequired'),
		nameMinLength: t('nameMinLength'),
	});
}

export type EmailSignUpSchema = z.infer<Awaited<ReturnType<typeof getEmailSignUpSchema>>>;
