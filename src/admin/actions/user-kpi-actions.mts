import type { ActionHandler, ActionResponse, RecordActionResponse } from 'adminjs';
import { prisma } from '../prisma.mts';

type UserKpisPayload = {
	totalOrders: number;
	lifetimeValue: number;
	averageOrderValue: number;
	lastOrderDate: string | null;
};

const roundCurrency = (value: number) => Math.round(value * 100) / 100;
const paidStatuses = ['PAID', 'SHIPPED', 'DELIVERED'] as const;

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

export const attachUserListKpis = async (response: ActionResponse): Promise<ActionResponse> => {
	if (!response?.records || !Array.isArray(response.records) || response.records.length === 0) {
		return response;
	}

	const userIds = response.records
		.map((record) => record.id ?? record?.params?.id)
		.filter((id): id is string => typeof id === 'string' && id.length > 0);

	if (!userIds.length) return response;

	const [ltvAgg, lastOrderAgg] = await prisma.$transaction([
		prisma.order.groupBy({
			by: ['userId'],
			where: { userId: { in: userIds }, status: { in: [...paidStatuses] } },
			orderBy: { userId: 'asc' },
			_sum: { total: true },
		}),
		prisma.order.groupBy({
			by: ['userId'],
			where: { userId: { in: userIds } },
			orderBy: { userId: 'asc' },
			_max: { createdAt: true },
		}),
	]);

	const ltvMap = new Map(
		ltvAgg.map((item) => [item.userId, roundCurrency(Number(item._sum?.total ?? 0))])
	);
	const lastOrderMap = new Map(
		lastOrderAgg.map((item) => [item.userId, item._max?.createdAt ?? null])
	);

	response.records.forEach((record) => {
		const userId = (record.id ?? record?.params?.id) as string | undefined;
		if (!userId) return;
		const lifetimeValue = ltvMap.get(userId) ?? 0;
		const lastOrderDate = lastOrderMap.get(userId);
		record.params = {
			...record.params,
			lifetimeValue,
			lastOrderDate: lastOrderDate ? lastOrderDate.toISOString() : null,
		};
	});

	return response;
};
