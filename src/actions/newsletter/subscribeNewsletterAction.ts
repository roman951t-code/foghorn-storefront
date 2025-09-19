'use server';

import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function subscribeNewsletterAction(
	_: unknown,
	formData: { email: string; name?: string }
): Promise<{ success: boolean; message?: string }> {
	const genT = await getTranslations('General');
	const authT = await getTranslations('Auth');
	const t = await getTranslations('Validation');

	const session = await auth.api.getSession({
		headers: await headers(),
	});
	const userId = session?.user?.id;

	if (!formData.email) {
		return { success: false, message: t('invalidFormData') };
	}

	try {
		const existing = await prisma.newsletterSubscription.findUnique({
			where: { email: formData.email },
		});

		if (existing) {
			return { success: false, message: t('alreadySubscribed') };
		}

		await prisma.newsletterSubscription.create({
			data: {
				email: formData.email,
			},
		});

		await prisma.user.update({
			where: { id: userId },
			data: { subscribed: true },
		});

		await resend.emails.send({
			from: 'Acme <onboarding@resend.dev>',
			to: [formData.email],
			subject: genT('subscribeProcedure'),
			text: `${authT('hiUser')} ${formData.name ?? ''},\n\n${genT(
				'subscribedSuccessfully'
			)}\n\n${genT('thanksForJoining')}`,
		});

		return { success: true };
	} catch (error: any) {
		return { success: false, message: t('subscribeFail') };
	}
}
