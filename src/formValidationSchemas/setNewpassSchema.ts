import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import type { I18nData } from '@/types/i18n';

export const setNewPassSchema = (t: {
	passwordRequired: string;
	passwordMin: string;
	passwordMax: string;
	passwordUppercase: string;
	passwordLowercase: string;
	passwordAlphabetic: string;
	passwordUnderscore: string;
}) =>
	z.object({
		password: z
			.string({ message: t.passwordRequired })
			.min(8, { message: t.passwordMin })
			.max(12, { message: t.passwordMax })
			.regex(/[A-Z]/, { message: t.passwordUppercase })
			.regex(/[a-z]/, { message: t.passwordLowercase })
			.regex(/[a-zA-Z]/, { message: t.passwordAlphabetic })
			.regex(/_/, { message: t.passwordUnderscore }),
	});

export const createNewPassSchema = (t: I18nData) =>
	setNewPassSchema(t as Parameters<typeof setNewPassSchema>[0]);

export async function getNewPassSchema() {
	const validationT = await getTranslations('validation');

	return setNewPassSchema({
		passwordRequired: validationT('passwordRequired'),
		passwordMin: validationT('passwordMin'),
		passwordMax: validationT('passwordMax'),
		passwordUppercase: validationT('passwordUppercase'),
		passwordLowercase: validationT('passwordLowercase'),
		passwordAlphabetic: validationT('passwordAlphabetic'),
		passwordUnderscore: validationT('passwordUnderscore'),
	});
}

export type RestorePassSchema = z.infer<Awaited<ReturnType<typeof getNewPassSchema>>>;
