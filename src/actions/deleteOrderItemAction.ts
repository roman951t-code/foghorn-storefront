'use server';

import 'server-only';

import { Prisma } from '@prisma/client';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { normalizeOrder } from './orderUtils';
import type { UserOrder } from '@/types/order';

type Result =
	| { success: true; order?: UserOrder }
	| { success: false; code: 'unauthorized' | 'not-found' | 'empty' };

export async function deleteOrderItemAction(orderItemId: string): Promise<Result> {
	const requestHeaders = await headers();
	const session = await auth.api.getSession({ headers: requestHeaders });
	const userId = session?.user?.id;

	if (!userId) return { success: false, code: 'unauthorized' };

	const orderItem = await prisma.orderItem.findUnique({
		where: { id: orderItemId },
		include: {
			order: {
				include: {
					items: {
						include: {
							product: { select: { id: true, name: true, fullSlug: true, imageUrl: true } },
						},
					},
				},
			},
		},
	});

	if (!orderItem || orderItem.order.userId !== userId) {
		return { success: false, code: 'not-found' };
	}

	const orderId = orderItem.orderId;

	const result = await prisma.$transaction(async (tx) => {
		const order = await tx.order.findUnique({
			where: { id: orderId },
			include: {
				items: {
					include: {
						product: { select: { id: true, name: true, fullSlug: true, imageUrl: true } },
					},
				},
			},
		});

		if (!order || order.userId !== userId) {
			return { success: false as const, code: 'not-found' as const };
		}

		const remainingItems = order.items.filter((item) => item.id !== orderItemId);

		if (remainingItems.length === 0) {
			await tx.orderItem.delete({ where: { id: orderItemId } });
			await tx.order.delete({ where: { id: orderId } });
			return { success: true as const, order: undefined };
		}

		await tx.orderItem.delete({ where: { id: orderItemId } });

		const newTotal = remainingItems.reduce((acc, item) => acc + Number(item.price ?? 0), 0);

		const updated = await tx.order.update({
			where: { id: orderId },
			data: { total: new Prisma.Decimal(newTotal.toFixed(2)) },
			include: {
				items: {
					include: {
						product: { select: { id: true, name: true, fullSlug: true, imageUrl: true } },
					},
				},
			},
		});

		return { success: true as const, order: updated };
	});

	if (!result.success) return result;

	if (!result.order) {
		return { success: true, order: undefined };
	}

	const normalized = await normalizeOrder(result.order);
	return { success: true, order: normalized };
}
