'use server';
import 'server-only';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { FeedbackSchema, getFeedbackSchema } from 'validationSchemas/feedbackSchema';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import { updateTag } from 'next/cache';
import { productCacheTagById } from '@/constants/products';
import { syncProductReviewAggregate } from '@/lib/reviewAggregates';
import type { Review } from '@/types/product';

export async function leaveFeedback(
	_: unknown,
	formData: FeedbackSchema,
	productId: string,
): Promise<{ success: boolean; message?: string; review?: Review }> {
	const validationT = await getTranslations('validation');

	const schema = await getFeedbackSchema();

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	const userId = session?.user?.id;
	if (!userId) {
		return { success: false, message: validationT('userNotFound') };
	}

	const validatedFormData = schema.safeParse(formData);

	if (!validatedFormData.success) {
		return { success: false, message: validationT('invalidFormData') };
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

		const savedReview = await prisma.$transaction(async (tx) => {
			const review = await tx.review.upsert({
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

			await syncProductReviewAggregate(tx, productId);

			return review;
		});

		await updateTag(productCacheTagById(productId));

		return {
			success: true,
			review: {
				id: savedReview.id,
				rating: savedReview.rating,
				comment: savedReview.comment,
				advantages: savedReview.advantages,
				disadvantages: savedReview.disadvantages,
				createdAt: savedReview.createdAt,
				isMine: true,
				user: {
					name,
					lastName: lastName ?? null,
				},
			},
		};
	} catch (error: any) {
		return { success: false };
	}
}
