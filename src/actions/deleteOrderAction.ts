'use server';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Result = { success: true } | { success: false; code: 'unauthorized' | 'not-found' };

export async function deleteOrderAction(orderId: string): Promise<Result> {
	const requestHeaders = await headers();
	const session = await auth.api.getSession({ headers: requestHeaders });
	const userId = session?.user?.id;

	if (!userId) return { success: false, code: 'unauthorized' };

	const order = await prisma.order.findUnique({
		where: { id: orderId },
		select: { id: true, userId: true },
	});

	if (!order || order.userId !== userId) {
		return { success: false, code: 'not-found' };
	}

	await prisma.$transaction([
		prisma.orderItem.deleteMany({ where: { orderId } }),
		prisma.order.delete({ where: { id: orderId } }),
	]);

	return { success: true };
}
