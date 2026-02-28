import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import type { I18nData } from '@/types/i18n';

const emailSignUpSchemaShape = (t: {
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
	nameRequired: string;
	nameMinLength: string;
}) =>
	z
		.object({
			name: z
				.string({ message: t.nameRequired })
				.min(2, { message: t.nameMinLength })
				.max(60, { message: t.inputMaxLength })
				.nonempty(),
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
			confirmPassword: z
				.string({ message: t.passwordRequired })
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
	const validationT = await getTranslations('validation');

	return emailSignUpSchemaShape({
		emailRequired: validationT('emailRequired'),
		inputMaxLength: validationT('inputMaxLength'),
		wrongEmail: validationT('wrongEmail'),
		passwordRequired: validationT('passwordRequired'),
		passwordMin: validationT('passwordMin'),
		passwordMax: validationT('passwordMax'),
		passwordUppercase: validationT('passwordUppercase'),
		passwordLowercase: validationT('passwordLowercase'),
		passwordAlphabetic: validationT('passwordAlphabetic'),
		passwordUnderscore: validationT('passwordUnderscore'),
		passwordsNotMatch: validationT('passwordsNotMatch'),
		nameRequired: validationT('nameRequired'),
		nameMinLength: validationT('nameMinLength'),
	});
}

export type EmailSignUpSchema = z.infer<Awaited<ReturnType<typeof getEmailSignUpSchema>>>;
