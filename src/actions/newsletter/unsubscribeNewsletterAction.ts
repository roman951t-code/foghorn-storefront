'use server';

import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function unsubscribeNewsletterAction(
	_: unknown,
	formData: { email: string }
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

		if (!existing) {
			return { success: false, message: t('notSubscribed') };
		}

		await prisma.newsletterSubscription.delete({
			where: { email: formData.email },
		});

		if (userId) {
			await prisma.user.update({
				where: { id: userId },
				data: { subscribed: false },
			});
		}

		await resend.emails.send({
			from: 'Acme <onboarding@resend.dev>',
			to: [formData.email],
			subject: genT('unsubscribeProcedure'),
			text: `${authT('hiUser')} ${
				session?.user?.name ?? ''
			},\n\n${genT('unsubscribedSuccessfully')}}`,
		});

		return { success: true };
	} catch (error: any) {
		return { success: false, message: t('unsubscribeFail') };
	}
}
