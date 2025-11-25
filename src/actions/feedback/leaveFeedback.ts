'use server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { FeedbackSchema, getFeedbackSchema } from 'formValidationSchemas/feedbackSchema';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';

export async function leaveFeedback(
	_: unknown,
	formData: FeedbackSchema,
	productId: string
): Promise<{ success: boolean; message?: string }> {
	const t = await getTranslations('validation');

	const schema = await getFeedbackSchema();

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	const userId = session?.user?.id;
	if (!userId) {
		return { success: false, message: t('userNotFound') };
	}

	const validatedFormData = schema.safeParse(formData);

	if (!validatedFormData.success) {
		return { success: false, message: t('invalidFormData') };
	}

	const { name, lastName } = validatedFormData.data;

	try {
		const currentUser = await prisma.user.findUnique({
			where: { id: userId },
			select: { name: true, lastName: true },
		});

		const isNameChanged = name !== currentUser?.name;
		const isLastNameChanged = lastName !== currentUser?.lastName;

		if (isNameChanged || isLastNameChanged) {
			await prisma.user.update({
				where: { id: userId },
				data: { name, lastName },
			});
		}

		await prisma.review.upsert({
			where: {
				userId_productId: {
					userId,
					productId,
				},
			},
			update: {
				rating: formData.rating,
				comment: formData.feedback,
				advantages: formData.advantages ?? null,
				disadvantages: formData.disAdvantages ?? null,
			},
			create: {
				userId,
				productId,
				rating: formData.rating,
				comment: formData.feedback,
				advantages: formData.advantages ?? null,
				disadvantages: formData.disAdvantages ?? null,
			},
		});

		return { success: true };
	} catch (error: any) {
		return { success: false };
	}
}
