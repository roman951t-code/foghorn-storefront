'use server';

import 'server-only';

import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { normalizeOrder } from './orderUtils';
import type { UserOrder } from '@/types/order';
import { MAX_PRODUCTS_PER_PAGE } from '@/constants/pagination';
import { getRequestLocale } from '@/utils/i18nServerUtils';

export async function getUserOrders(limit: number, offset = 0): Promise<{
	items: UserOrder[];
	totalCount: number;
}> {
	const safeLimit = Math.min(MAX_PRODUCTS_PER_PAGE, Math.max(1, Math.floor(limit || 1)));
	const safeOffset = Math.max(0, Math.floor(offset || 0));

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
			skip: safeOffset,
			take: safeLimit,
			select: {
				id: true,
				total: true,
				status: true,
				createdAt: true,
				paymentMethod: true,
				shipmentMethod: true,
				shippingAddress: true,
				shippingCountry: true,
				shippingRegion: true,
				shippingCity: true,
				shippingPostalCode: true,
				shippingAddressLine1: true,
				shippingAddressLine2: true,
				carrier: true,
				trackingNumber: true,
				discounts: {
					select: {
						amount: true,
						code: true,
						label: true,
					},
				},
				items: {
					select: {
						id: true,
						productId: true,
						variantId: true,
						snapshotLocale: true,
						snapshotProductName: true,
						snapshotVariantLabel: true,
						snapshotVariantSku: true,
						quantity: true,
						baseUnitPrice: true,
						unitPrice: true,
						price: true,
						product: {
							select: {
								id: true,
								name: true,
								fullSlug: true,
								imageUrl: true,
								productImages: {
									select: { url: true, sortOrder: true, createdAt: true },
									orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
									take: 1,
								},
							},
						},
						variant: {
							select: {
								id: true,
								sku: true,
								attributes: {
									select: {
										attribute: { select: { name: true, unit: true } },
										value: true,
									},
									orderBy: { attribute: { name: 'asc' } },
								},
							},
						},
					},
				},
			},
		}),
	]);

	const locale = await getRequestLocale();
	const normalizedItems = await Promise.all(orders.map((order) => normalizeOrder(order, locale)));
	return { items: normalizedItems, totalCount };
}
