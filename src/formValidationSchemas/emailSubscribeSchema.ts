import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import type { I18nData } from '@/types/i18n';

export const emailSubscribeSchema = (t: {
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

export const createEmailSubscribeSchema = (t: I18nData) =>
	emailSubscribeSchema(t as Parameters<typeof emailSubscribeSchema>[0]);

export async function getEmailSubscribeSchema() {
	const validationT = await getTranslations('validation');

	return emailSubscribeSchema({
		emailRequired: validationT('emailRequired'),
		inputMaxLength: validationT('inputMaxLength'),
		wrongEmail: validationT('wrongEmail'),
	});
}

export type EmailSchema = z.infer<Awaited<ReturnType<typeof getEmailSubscribeSchema>>>;
