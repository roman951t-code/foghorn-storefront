import type { ActionHandler, RecordActionResponse } from 'adminjs';
import { prisma } from '../prisma.mts';

type ProductKpisPayload = {
	wishlistCount: number;
	recentlyViewedCount: number;
	itemsSold: number;
	revenue: number;
	paidOrderCount: number;
	conversionProxy: number;
};

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

export const productKpis: ActionHandler<RecordActionResponse> = async (_req, _res, context) => {
	const { record, currentAdmin } = context;
	if (!record) {
		throw new Error('Missing record context');
	}

	const productId = record.param('id') as string;
	const paidStatuses = ['PAID', 'SHIPPED', 'DELIVERED'] as const;

	const wishlistCountPromise = prisma.wishlist.count({ where: { productId } });
	const recentlyViewedCountPromise = prisma.recentlyViewed.count({ where: { productId } });

	const paidLineAggPromise = prisma.orderItem.aggregate({
		where: { productId, order: { status: { in: [...paidStatuses] } } },
		_sum: { quantity: true, price: true },
	});

	const paidOrderCountPromise = prisma.order.count({
		where: {
			status: { in: [...paidStatuses] },
			items: { some: { productId } },
		},
	});

	const [wishlistCount, recentlyViewedCount, paidLineAgg, paidOrderCount] = await Promise.all([
		wishlistCountPromise,
		recentlyViewedCountPromise,
		paidLineAggPromise,
		paidOrderCountPromise,
	]);

	const itemsSold = Number(paidLineAgg._sum.quantity ?? 0);
	const revenue = roundCurrency(Number(paidLineAgg._sum.price ?? 0));
	const conversionProxy = recentlyViewedCount > 0 ? paidOrderCount / recentlyViewedCount : 0;

	const payload: ProductKpisPayload = {
		wishlistCount,
		recentlyViewedCount,
		itemsSold,
		revenue,
		paidOrderCount,
		conversionProxy,
	};

	return {
		record: record.toJSON(currentAdmin),
		payload,
	};
};
