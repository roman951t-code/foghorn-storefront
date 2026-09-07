import { z } from 'zod';
import type { I18nData } from '@/types/i18n';

const phoneVerifySchemaShape = (t: { pinRequired: string; pinLength: string }) =>
	z.object({
		otp: z
			.array(z.string().min(1), { message: t.pinRequired })
			.length(6, { message: t.pinLength }),
	});

export const createPhoneVerifySchema = (t: I18nData) =>
	phoneVerifySchemaShape(t as Parameters<typeof phoneVerifySchemaShape>[0]);

export type PhoneVerifySchema = z.infer<ReturnType<typeof createPhoneVerifySchema>>;
