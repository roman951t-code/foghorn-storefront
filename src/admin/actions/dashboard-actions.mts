import type { PageHandler } from 'adminjs';
import { Prisma } from '@prisma/client';
import { prisma } from '../prisma.mts';

const paidStatuses = ['PAID', 'SHIPPED', 'DELIVERED'] as const;
const orderStatuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'] as const;

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

const startOfToday = (now: Date) => {
	const start = new Date(now);
	start.setHours(0, 0, 0, 0);
	return start;
};

const startOfDaysAgo = (start: Date, days: number) => {
	const next = new Date(start);
	next.setDate(next.getDate() - Math.max(0, days - 1));
	return next;
};

export const dashboardMetrics: PageHandler = async () => {
	const now = new Date();
	const todayStart = startOfToday(now);
	const trendDays = 14;
	const trendStart = startOfDaysAgo(todayStart, trendDays);
	const last7DaysStart = startOfDaysAgo(todayStart, 7);
	const last30DaysStart = startOfDaysAgo(todayStart, 30);

		const [
			salesTodayAgg,
			salesTrendAgg,
			ordersTrendAgg,
			sales7DaysAgg,
			sales30DaysAgg,
			newUsers7Days,
			newSubscribers7Days,
			totalSubscribers,
			refunds30DaysAgg,
			statusCounts,
			topProductsAgg,
		] = await prisma.$transaction([
		prisma.order.aggregate({
			where: { status: { in: [...paidStatuses] }, createdAt: { gte: todayStart } },
			_sum: { total: true },
		}),
		prisma.$queryRaw<{ day: string; total: number }[]>(
			Prisma.sql`
				select
					to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') as day,
					coalesce(sum(total), 0)::float as total
				from "Order"
				where status in (${Prisma.join([...paidStatuses])})
					and "createdAt" >= ${trendStart}
				group by 1
				order by 1 asc
			`
		),
		prisma.$queryRaw<{ day: string; count: number }[]>(
			Prisma.sql`
				select
					to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') as day,
					count(*)::int as count
				from "Order"
				where status in (${Prisma.join([...paidStatuses])})
					and "createdAt" >= ${trendStart}
				group by 1
				order by 1 asc
			`
		),
		prisma.order.aggregate({
			where: { status: { in: [...paidStatuses] }, createdAt: { gte: last7DaysStart } },
			_sum: { total: true },
		}),
			prisma.order.aggregate({
				where: { status: { in: [...paidStatuses] }, createdAt: { gte: last30DaysStart } },
				_sum: { total: true },
			}),
			prisma.user.count({ where: { createdAt: { gte: last7DaysStart } } }),
			prisma.newsletterSubscription.count({ where: { createdAt: { gte: last7DaysStart } } }),
			prisma.newsletterSubscription.count(),
			prisma.order.aggregate({
				where: { refundedAt: { not: null, gte: last30DaysStart } },
				_sum: { refundAmount: true },
				_count: { _all: true },
			}),
		prisma.order.groupBy({
			by: ['status'],
			where: { createdAt: { gte: last30DaysStart } },
			orderBy: { status: 'asc' },
			_count: { _all: true },
		}),
		prisma.orderItem.groupBy({
			by: ['productId'],
			where: {
				order: { status: { in: [...paidStatuses] }, createdAt: { gte: last30DaysStart } },
			},
			_sum: { quantity: true, price: true },
			orderBy: { _sum: { quantity: 'desc' } },
			take: 5,
		}),
	]);

	const productIds = topProductsAgg.map((item) => item.productId);
	const products = productIds.length
		? await prisma.product.findMany({
				where: { id: { in: productIds } },
				select: { id: true, name: true },
			})
		: [];
	const productMap = new Map(products.map((product) => [product.id, product.name]));

	const statusMap = new Map(
		statusCounts.map((item) => [item.status, Number((item as any)?._count?._all ?? 0)])
	);

	const trendTotalsByDay = new Map(salesTrendAgg.map((p) => [p.day, roundCurrency(Number(p.total ?? 0))]));
	const trendOrdersByDay = new Map(ordersTrendAgg.map((p) => [p.day, Number(p.count ?? 0)]));
	const trendPoints = Array.from({ length: trendDays }, (_, idx) => {
		const day = new Date(trendStart);
		day.setDate(day.getDate() + idx);
		const key = day.toISOString().slice(0, 10);
		return {
			day: key,
			total: trendTotalsByDay.get(key) ?? 0,
			orders: trendOrdersByDay.get(key) ?? 0,
		};
	});

	return {
		payload: {
			sales: {
				today: roundCurrency(Number(salesTodayAgg._sum?.total ?? 0)),
				last7Days: roundCurrency(Number(sales7DaysAgg._sum?.total ?? 0)),
				last30Days: roundCurrency(Number(sales30DaysAgg._sum?.total ?? 0)),
			},
			salesTrend: {
				days: trendDays,
				points: trendPoints,
			},
			ordersTrend: {
				days: trendDays,
				points: trendPoints,
			},
			newUsers: {
				last7Days: Number(newUsers7Days ?? 0),
			},
			newSubscribers: {
				last7Days: Number(newSubscribers7Days ?? 0),
				total: Number(totalSubscribers ?? 0),
			},
			refunds: {
				last30Days: {
					count: Number(refunds30DaysAgg._count?._all ?? 0),
					amount: roundCurrency(Number(refunds30DaysAgg._sum?.refundAmount ?? 0)),
				},
			},
			orderStatusCounts: orderStatuses.map((status) => ({
				status,
				count: statusMap.get(status) ?? 0,
			})),
			topProducts: topProductsAgg.map((item) => ({
				productId: item.productId,
				name: productMap.get(item.productId) ?? 'Unknown product',
				quantity: Number(item._sum?.quantity ?? 0),
				revenue: roundCurrency(Number(item._sum?.price ?? 0)),
			})),
		},
	};
};
