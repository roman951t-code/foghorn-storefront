import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import type { I18nData } from '@/types/i18n';

const resetPassSchemaShape = (t: {
	emailRequired: string;
	inputMaxLength: string;
	wrongEmail: string;
}) =>
	z.object({
		email: z
			.string({ message: t.emailRequired })
			.max(60, { message: t.inputMaxLength })
			.email({ message: t.wrongEmail }),
	});

export const createResetPassSchema = (t: I18nData) =>
	resetPassSchemaShape(t as Parameters<typeof resetPassSchemaShape>[0]);

export async function getResetPassSchema() {
	const validationT = await getTranslations('validation');

	return resetPassSchemaShape({
		emailRequired: validationT('emailRequired'),
		inputMaxLength: validationT('inputMaxLength'),
		wrongEmail: validationT('wrongEmail'),
	});
}

export type ResetPassSchema = z.infer<Awaited<ReturnType<typeof getResetPassSchema>>>;
