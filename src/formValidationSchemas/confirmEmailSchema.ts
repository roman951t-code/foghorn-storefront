import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import type { I18nData } from '@/types/i18n';

export const confirmEmailSchemaShape = (t: { pinRequired: string; pinLength: string }) =>
	z.object({
		pin: z
			.array(z.string().min(1), { message: t.pinRequired })
			.length(6, { message: t.pinLength }),
	});

export const createConfirmEmailSchema = (t: I18nData) =>
	confirmEmailSchemaShape(t as Parameters<typeof confirmEmailSchemaShape>[0]);

export async function getConfirmEmailSchema() {
	const validationT = await getTranslations('validation');

	return confirmEmailSchemaShape({
		pinRequired: validationT('pinRequired'),
		pinLength: validationT('pinLength'),
	});
}

export type confirmEmailSchema = z.infer<Awaited<ReturnType<typeof getConfirmEmailSchema>>>;
