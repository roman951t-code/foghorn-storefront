import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import type { I18nData } from '@/types/i18n';

export const restorePassSchemaShape = (t: {
	passwordRequired: string;
	passwordMin: string;
	passwordMax: string;
	passwordUppercase: string;
	passwordLowercase: string;
	passwordAlphabetic: string;
	passwordUnderscore: string;
	pinRequired: string;
	pinLength: string;
}) =>
	z.object({
		pin: z
			.array(z.string().min(1), { required_error: t.pinRequired })
			.length(5, { message: t.pinLength }),
		password: z
			.string({ required_error: t.passwordRequired })
			.min(8, { message: t.passwordMin })
			.max(12, { message: t.passwordMax })
			.regex(/[A-Z]/, { message: t.passwordUppercase })
			.regex(/[a-z]/, { message: t.passwordLowercase })
			.regex(/[a-zA-Z]/, { message: t.passwordAlphabetic })
			.regex(/_/, { message: t.passwordUnderscore }),
	});

export const createRestorePassSchema = (t: I18nData) =>
	restorePassSchemaShape(t as Parameters<typeof restorePassSchemaShape>[0]);

export async function getRestorePassSchema() {
	const t = await getTranslations('Validation');

	return restorePassSchemaShape({
		passwordRequired: t('passwordRequired'),
		passwordMin: t('passwordMin'),
		passwordMax: t('passwordMax'),
		passwordUppercase: t('passwordUppercase'),
		passwordLowercase: t('passwordLowercase'),
		passwordAlphabetic: t('passwordAlphabetic'),
		passwordUnderscore: t('passwordUnderscore'),
		pinRequired: t('pinRequired'),
		pinLength: t('pinLength'),
	});
}

export type RestorePassSchema = z.infer<Awaited<ReturnType<typeof getRestorePassSchema>>>;
