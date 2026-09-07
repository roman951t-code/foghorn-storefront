import { z } from 'zod';
import type { I18nData } from '@/types/i18n';

const emailSubscribeSchema = (t: {
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

export type EmailSchema = z.infer<ReturnType<typeof createEmailSubscribeSchema>>;
