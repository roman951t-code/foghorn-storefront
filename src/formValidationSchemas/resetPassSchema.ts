import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import type { I18nData } from '@/types/i18n';

export const resetPassSchemaShape = (t: {
	emailRequired: string;
	inputMaxLength: string;
	wrongEmail: string;
}) =>
	z.object({
		email: z
			.string({ required_error: t.emailRequired })
			.max(60, { message: t.inputMaxLength })
			.email({ message: t.wrongEmail }),
	});

export const createResetPassSchema = (t: I18nData) =>
	resetPassSchemaShape(t as Parameters<typeof resetPassSchemaShape>[0]);

export async function getResetPassSchema() {
	const t = await getTranslations('Validation');

	return resetPassSchemaShape({
		emailRequired: t('emailRequired'),
		inputMaxLength: t('inputMaxLength'),
		wrongEmail: t('wrongEmail'),
	});
}

export type ResetPassSchema = z.infer<Awaited<ReturnType<typeof getResetPassSchema>>>;
