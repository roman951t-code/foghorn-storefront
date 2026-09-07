'use server';

import 'server-only';

import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { z } from 'zod';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { DEFAULT_FROM, renderEmailTemplate, resendClient } from '@/lib/emailTemplates';

const SubscribeSchema = z.object({
	email: z.string().email(),
	name: z.string().optional(),
});

export async function subscribeNewsletterAction(
	_: unknown,
	formData: { email: string; name?: string }
): Promise<{ success: boolean; message?: string }> {
	const [commonT, validationT, emailsT] = await Promise.all([
		getTranslations('common'),
		getTranslations('validation'),
		getTranslations('emails'),
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

		const recipientName = session.user?.name ?? parsed.data.name ?? emailsT('defaultRecipient');
		const emailContent = renderEmailTemplate({
			subject: emailsT('newsletterSubscribedSubject'),
			title: emailsT('newsletterSubscribedSubject'),
			salutation: `${emailsT('greeting')} ${recipientName},`,
			intro: [emailsT('newsletterSubscribedIntro')],
			outro: [commonT('thanksForJoining'), emailsT('farewell'), emailsT('help')],
			footer: emailsT('signature'),
			brandName: emailsT('brandName'),
		});

		await resendClient.emails.send({
			from: DEFAULT_FROM,
			to: [formEmail],
			subject: emailContent.subject,
			html: emailContent.html,
			text: emailContent.text,
		});

		return { success: true };
	} catch (error: any) {
		return { success: false, message: validationT('subscribeFail') };
	}
}
