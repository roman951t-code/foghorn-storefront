'use server';

import 'server-only';

import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { MAX_NAME_LENGTH } from '@/constants/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

const REGISTER_PHONE_LIMIT_PER_USER = 6;
const REGISTER_PHONE_LIMIT_PER_IP = 20;
const REGISTER_PHONE_WINDOW_MS = 10 * 60 * 1000;

const RegisterPhoneSchema = z.object({
	name: z.string().trim().min(1).max(MAX_NAME_LENGTH),
	phone: z.string().trim().min(7).max(20),
});

export async function registerPhoneAction(
	_: unknown,
	formData: unknown
): Promise<{ success: boolean; message?: string } | undefined> {
	const validationT = await getTranslations('validation');
	const validated = RegisterPhoneSchema.safeParse(formData);

	if (!validated.success) {
		return { success: false, message: validationT('invalidFormData') };
	}

	const requestHeaders = await headers();
	const session = await auth.api.getSession({ headers: requestHeaders });
	const userId = session?.user?.id;

	if (!userId) {
		return { success: false, message: validationT('userNotFound') };
	}

	const rawPhone = validated.data.phone.replace(/\D/g, '');
	const normalizedName = validated.data.name.trim();

	if (rawPhone.length < 8 || rawPhone.length > 15) {
		return { success: false, message: validationT('invalidFormData') };
	}

	const ip = getClientIp(requestHeaders);
	const [userRate, ipRate] = await Promise.all([
		checkRateLimit({
			key: `auth:register-phone:user:${userId}`,
			limit: REGISTER_PHONE_LIMIT_PER_USER,
			windowMs: REGISTER_PHONE_WINDOW_MS,
		}),
		checkRateLimit({
			key: `auth:register-phone:ip:${ip}`,
			limit: REGISTER_PHONE_LIMIT_PER_IP,
			windowMs: REGISTER_PHONE_WINDOW_MS,
		}),
	]);

	if (!userRate.allowed || !ipRate.allowed) {
		return { success: false, message: validationT('tooManyRequests') };
	}

	try {
		const currentUser = await prisma.user.findUnique({
			where: { id: userId },
			select: { phoneNumber: true, phoneNumberVerified: true },
		});

		// Allow updates only for the currently authenticated owner of this phone.
		if (!currentUser?.phoneNumber || currentUser.phoneNumber !== rawPhone) {
			return { success: false, message: validationT('userRegisterFail') };
		}
		if (!currentUser.phoneNumberVerified) {
			return { success: false, message: validationT('userRegisterFail') };
		}

		await prisma.user.update({
			where: { id: userId },
			data: {
				name: normalizedName,
				notificationMethod: 'phone',
			},
		});

		return { success: true };
	} catch {
		return {
			success: false,
			message: validationT('userRegisterFail'),
		};
	}
}
