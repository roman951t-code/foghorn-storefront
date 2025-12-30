'use server';

import 'server-only';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { normalizeOrder } from './orderUtils';
import type { UserOrder } from '@/types/order';

export async function getUserOrders(limit: number, offset = 0): Promise<{
	items: UserOrder[];
	totalCount: number;
}> {
	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id;

	if (!userId) {
		return { items: [], totalCount: 0 };
	}

	const [totalCount, orders] = await Promise.all([
		prisma.order.count({ where: { userId } }),
		prisma.order.findMany({
			where: { userId },
			orderBy: { createdAt: 'desc' },
			skip: offset,
			take: limit,
			include: {
				items: {
					include: {
						product: {
							select: {
								id: true,
								name: true,
								fullSlug: true,
								imageUrl: true,
							},
						},
					},
				},
			},
		}),
	]);

	const normalizedItems = await Promise.all(orders.map((order) => normalizeOrder(order)));
	return { items: normalizedItems, totalCount };
}
