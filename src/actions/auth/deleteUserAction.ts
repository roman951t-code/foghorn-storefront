'use server';

import 'server-only';

import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

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
		await prisma.$transaction(async (tx) => {
			const user = await tx.user.findUnique({
				where: { id: userId },
				select: { id: true, email: true, phoneNumber: true },
			});
			if (!user) {
				throw new Error('user_not_found');
			}

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
		});

		return { success: true };
	} catch (error) {
		return { success: false, message: validationT('deleteFailed') };
	}
}
