import { z } from 'zod';
import type { I18nData } from '@/types/i18n';

const confirmResetPassSchema = (t: {
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
	confirmResetPassSchema(t as Parameters<typeof confirmResetPassSchema>[0]);

export type ConfirmResetPassSchema = z.infer<ReturnType<typeof createConfirmResetPassSchema>>;
