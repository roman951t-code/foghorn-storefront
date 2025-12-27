'use server';

import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { unstable_noStore as noStore } from 'next/cache';
import { env } from '@/config/env';
import { z } from 'zod';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

const resend = new Resend(env.RESEND_API_KEY);
const SubscribeSchema = z.object({
	email: z.string().email(),
	name: z.string().optional(),
});

export async function subscribeNewsletterAction(
	_: unknown,
	formData: { email: string; name?: string }
): Promise<{ success: boolean; message?: string }> {
	noStore();

	const [commonT, authT, validationT] = await Promise.all([
		getTranslations('common'),
		getTranslations('auth'),
		getTranslations('validation'),
	]);

	const requestHeaders = await headers();
	const session = await auth.api.getSession({
		headers: requestHeaders,
	});
	const userId = session?.user?.id;
	const userEmail = session?.user?.email?.toLowerCase?.();

	const parsed = SubscribeSchema.safeParse(formData);
	if (!parsed.success) {
		return { success: false, message: validationT('invalidFormData') };
	}

	const formEmail = parsed.data.email.toLowerCase();

	if (!userId || !userEmail || userEmail !== formEmail) {
		return { success: false, message: validationT('userNotFound') };
	}

	const rate = await checkRateLimit({
		key: `newsletter:subscribe:${userId ?? getClientIp(requestHeaders)}`,
		limit: 3,
		windowMs: 60_000,
	});

	if (!rate.allowed) {
		return { success: false, message: validationT('tooManyRequests') };
	}

	try {
		const existing = await prisma.newsletterSubscription.findUnique({
			where: { email: formEmail },
		});

		if (existing) {
			return { success: false, message: validationT('alreadySubscribed') };
		}

		await prisma.newsletterSubscription.create({
			data: {
				email: formEmail,
			},
		});

		await prisma.user.update({
			where: { id: userId },
			data: { subscribed: true },
		});

		await resend.emails.send({
			from: 'Acme <onboarding@resend.dev>',
			to: [formEmail],
			subject: commonT('subscribeProcedure'),
			text: `${authT('hiUser')} ${parsed.data.name ?? ''},\n\n${commonT(
				'subscribedSuccessfully'
			)}\n\n${commonT('thanksForJoining')}`,
		});

		return { success: true };
	} catch (error: any) {
		return { success: false, message: validationT('subscribeFail') };
	}
}
