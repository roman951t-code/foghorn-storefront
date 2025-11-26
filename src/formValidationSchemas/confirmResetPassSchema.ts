import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import type { I18nData } from '@/types/i18n';

export const resetConfirmResetPassSchema = (t: {
	pinRequired: string;
	pinLength: string;
	passwordRequired: string;
	passwordMin: string;
	passwordMax: string;
	passwordUppercase: string;
	passwordLowercase: string;
	passwordAlphabetic: string;
	passwordUnderscore: string;
}) =>
	z.object({
		otp: z
			.array(z.string().min(1), { message: t.pinRequired })
			.length(6, { message: t.pinLength }),
		password: z
			.string({ message: t.passwordRequired })
			.min(8, { message: t.passwordMin })
			.max(12, { message: t.passwordMax })
			.regex(/[A-Z]/, { message: t.passwordUppercase })
			.regex(/[a-z]/, { message: t.passwordLowercase })
			.regex(/[a-zA-Z]/, { message: t.passwordAlphabetic })
			.regex(/_/, { message: t.passwordUnderscore }),
	});

export const createConfirmResetPassSchema = (t: I18nData) =>
	resetConfirmResetPassSchema(t as Parameters<typeof resetConfirmResetPassSchema>[0]);

export async function getConfirmResetPassSchema() {
	const t = await getTranslations('validation');

	return resetConfirmResetPassSchema({
		pinRequired: t('pinRequired'),
		pinLength: t('pinLength'),
		passwordRequired: t('passwordRequired'),
		passwordMin: t('passwordMin'),
		passwordMax: t('passwordMax'),
		passwordUppercase: t('passwordUppercase'),
		passwordLowercase: t('passwordLowercase'),
		passwordAlphabetic: t('passwordAlphabetic'),
		passwordUnderscore: t('passwordUnderscore'),
	});
}

export type ConfirmResetPassSchema = z.infer<Awaited<ReturnType<typeof getConfirmResetPassSchema>>>;
