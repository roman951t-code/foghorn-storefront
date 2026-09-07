'use server';

import 'server-only';

import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { z } from 'zod';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { DEFAULT_FROM, renderEmailTemplate, resendClient } from '@/lib/emailTemplates';

const UnsubscribeSchema = z.object({
	email: z.string().email(),
});

export async function unsubscribeNewsletterAction(
	_: unknown,
	formData: { email: string }
): Promise<{ success: boolean; message?: string }> {
	const [validationT, emailsT] = await Promise.all([
		getTranslations('validation'),
		getTranslations('emails'),
	]);

	const requestHeaders = await headers();
	const session = await auth.api.getSession({
		headers: requestHeaders,
	});
	const userId = session?.user?.id;
	const userEmail = session?.user?.email?.toLowerCase?.();

	const parsed = UnsubscribeSchema.safeParse(formData);
	if (!parsed.success) {
		return { success: false, message: validationT('invalidFormData') };
	}

	const formEmail = parsed.data.email.toLowerCase();

	if (!userId || !userEmail || userEmail !== formEmail) {
		return { success: false, message: validationT('userNotFound') };
	}

	const rate = await checkRateLimit({
		key: `newsletter:unsubscribe:${userId ?? getClientIp(requestHeaders)}`,
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

		if (!existing) {
			return { success: false, message: validationT('notSubscribed') };
		}

		await prisma.newsletterSubscription.delete({
			where: { email: formEmail },
		});

		if (userId) {
			await prisma.user.update({
				where: { id: userId },
				data: { subscribed: false },
			});
		}

		const recipientName = session?.user?.name ?? emailsT('defaultRecipient');
		const emailContent = renderEmailTemplate({
			subject: emailsT('newsletterUnsubscribedSubject'),
			title: emailsT('newsletterUnsubscribedSubject'),
			salutation: `${emailsT('greeting')} ${recipientName},`,
			intro: [emailsT('newsletterUnsubscribedIntro')],
			outro: [emailsT('farewell'), emailsT('help')],
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
		return { success: false, message: validationT('unsubscribeFail') };
	}
}
