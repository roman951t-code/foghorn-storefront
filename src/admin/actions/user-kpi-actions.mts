import type { ActionHandler, RecordActionResponse } from 'adminjs';
import { prisma } from '../prisma.mts';

type UserKpisPayload = {
	totalOrders: number;
	lifetimeValue: number;
	averageOrderValue: number;
	lastOrderDate: string | null;
};

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

export const userKpis: ActionHandler<RecordActionResponse> = async (_req, _res, context) => {
	const { record, currentAdmin } = context;
	if (!record) {
		throw new Error('Missing record context');
	}

	const userId = record.param('id') as string;

	const totalOrdersPromise = prisma.order.count({ where: { userId } });
	const lastOrderPromise = prisma.order.findFirst({
		where: { userId },
		orderBy: { createdAt: 'desc' },
		select: { createdAt: true },
	});

	const paidStatuses = ['PAID', 'SHIPPED', 'DELIVERED'] as const;
	const paidAggregatePromise = prisma.order.aggregate({
		where: { userId, status: { in: [...paidStatuses] } },
		_sum: { total: true },
		_count: { _all: true },
	});

	const [totalOrders, lastOrder, paidAgg] = await Promise.all([
		totalOrdersPromise,
		lastOrderPromise,
		paidAggregatePromise,
	]);

	const ltv = roundCurrency(Number(paidAgg._sum.total ?? 0));
	const paidCount = Number(paidAgg._count._all ?? 0);
	const averageOrderValue = paidCount > 0 ? roundCurrency(ltv / paidCount) : 0;

	const payload: UserKpisPayload = {
		totalOrders,
		lifetimeValue: ltv,
		averageOrderValue,
		lastOrderDate: lastOrder?.createdAt ? lastOrder.createdAt.toISOString() : null,
	};

	return {
		record: record.toJSON(currentAdmin),
		payload,
	};
};
