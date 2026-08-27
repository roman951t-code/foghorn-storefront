'use server';

import 'server-only';

import * as Sentry from '@sentry/nextjs';
import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { updateTag } from 'next/cache';
import {
	PRODUCT_DETAIL_CACHE_TAG,
	PRODUCT_LIST_CACHE_TAG,
	productCacheTagById,
} from '@/constants/products';
import { syncProductReviewAggregates } from '@/lib/reviewAggregates';

export async function deleteUserAction(): Promise<{ success: boolean; message?: string }> {
	const validationT = await getTranslations('validation');

	const session = await auth.api.getSession({
		headers: await headers(),
	});
	const userId = session?.user?.id;

	if (!userId) {
		return { success: false, message: validationT('userNotFound') };
	}

	try {
		let affectedReviewProductIds: string[] = [];

		await prisma.$transaction(async (tx) => {
			const user = await tx.user.findUnique({
				where: { id: userId },
				select: { id: true, email: true, phoneNumber: true },
			});
			if (!user) {
				throw new Error('user_not_found');
			}

			const reviewProductIds = await tx.review.findMany({
				where: { userId },
				select: { productId: true },
				distinct: ['productId'],
			});
			affectedReviewProductIds = reviewProductIds.map((review) => review.productId);

			const [orderIds, cartIds] = await Promise.all([
				tx.order.findMany({ where: { userId }, select: { id: true } }),
				tx.cart.findMany({ where: { userId }, select: { id: true } }),
			]);

			if (orderIds.length > 0) {
				await tx.orderItem.deleteMany({
					where: { orderId: { in: orderIds.map((order) => order.id) } },
				});
			}

			if (cartIds.length > 0) {
				await tx.cartItem.deleteMany({
					where: { cartId: { in: cartIds.map((cart) => cart.id) } },
				});
			}

			await tx.cart.deleteMany({ where: { userId } });
			await tx.emailVerificationCode.deleteMany({ where: { userId } });

			if (user.email) {
				await Promise.all([
					tx.emailRegistrationCode.deleteMany({ where: { email: user.email } }),
					tx.newsletterSubscription.deleteMany({ where: { email: user.email } }),
				]);
			}

			if (user.phoneNumber) {
				await tx.verification.deleteMany({ where: { identifier: user.phoneNumber } });
			}

			await Promise.all([
				tx.session.deleteMany({ where: { userId } }),
				tx.account.deleteMany({ where: { userId } }),
			]);

			await tx.user.delete({ where: { id: userId } });

			if (affectedReviewProductIds.length > 0) {
				await syncProductReviewAggregates(tx, affectedReviewProductIds);
			}
		});

		if (affectedReviewProductIds.length > 0) {
			updateTag(PRODUCT_LIST_CACHE_TAG);
			updateTag(PRODUCT_DETAIL_CACHE_TAG);
			for (const productId of affectedReviewProductIds) {
				updateTag(productCacheTagById(productId));
			}
		}

		return { success: true };
	} catch (error) {
		Sentry.captureException(error, { tags: { authAction: 'delete-user' } });
		return { success: false, message: validationT('deleteFailed') };
	}
}
