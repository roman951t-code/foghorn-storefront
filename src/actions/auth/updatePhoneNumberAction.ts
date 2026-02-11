'use server';

import 'server-only';

import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import { getAccountSchemas } from 'validationSchemas/accountSchema';
import { prisma } from '@/lib/prisma';
import { autoVerifyPhoneNumber } from './phoneVerificationHelper';
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';

const UPDATE_PHONE_LIMIT_PER_USER = 5;
const UPDATE_PHONE_LIMIT_PER_PHONE = 4;
const UPDATE_PHONE_WINDOW_MS = 10 * 60 * 1000;

export async function updatePhoneNumberAction(
	_: unknown,
	formData: unknown
): Promise<{ success: boolean; message?: string } | undefined> {
	const validationT = await getTranslations('validation');
	const { phoneSchema } = await getAccountSchemas();
	const validated = phoneSchema.safeParse(formData);

	if (!validated.success) {
		return { success: false, message: validationT('invalidFormData') };
	}

	const { phone } = validated.data;
	const rawPhone = phone.replace(/\D/g, '');

	const session = await auth.api.getSession({ headers: await headers() });
	const currentUserId = session?.user?.id;

	if (!currentUserId) {
		return { success: false, message: validationT('userNotFound') };
	}

	const [userRate, phoneRate] = await Promise.all([
		checkRateLimit({
			key: `auth:phone-update:user:${currentUserId}`,
			limit: UPDATE_PHONE_LIMIT_PER_USER,
			windowMs: UPDATE_PHONE_WINDOW_MS,
		}),
		checkRateLimit({
			key: `auth:phone-update:phone:${rawPhone}`,
			limit: UPDATE_PHONE_LIMIT_PER_PHONE,
			windowMs: UPDATE_PHONE_WINDOW_MS,
		}),
	]);

	if (!userRate.allowed || !phoneRate.allowed) {
		return { success: false, message: validationT('tooManyRequests') };
	}

	const existingUserWithPhone = await prisma.user.findUnique({
		where: { phoneNumber: rawPhone },
		select: { id: true },
	});

	if (existingUserWithPhone && existingUserWithPhone.id !== currentUserId) {
		return { success: false, message: validationT('userExists') };
	}

	try {
		await autoVerifyPhoneNumber({
			phoneNumber: rawPhone,
			updatePhoneNumber: true,
			disableSession: true,
		});

		return { success: true };
	} catch (error: any) {
		const messageKey = error?.body?.message ?? error?.message ?? '';
		const errorMap: Record<string, string> = {
			'Phone number already exists': validationT('userExists'),
			'User not found': validationT('userNotFound'),
			'Too many requests': validationT('tooManyRequests'),
		};

		return {
			success: false,
			message: errorMap[messageKey] || validationT('userRegisterFail'),
		};
	}
}
