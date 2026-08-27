import type { PageHandler } from 'adminjs';
import { Prisma } from '@prisma/client';
import { prisma } from '../prisma.mts';

const paidStatuses = ['PAID', 'SHIPPED', 'DELIVERED'] as const;
const orderStatuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'] as const;

type MoneyComparison = {
	current: number;
	previous: number;
	delta: number;
	changePercent: number | null;
};

type CountComparison = {
	current: number;
	previous: number;
	delta: number;
	changePercent: number | null;
};

const roundCurrency = (value: number) => Math.round(value * 100) / 100;
const roundPercent = (value: number) => Math.round(value * 10) / 10;

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

const toNumber = (value: unknown) => {
	const numeric = Number(value ?? 0);
	return Number.isFinite(numeric) ? numeric : 0;
};

const buildMoneyComparison = (current: number, previous: number): MoneyComparison => {
	const safeCurrent = roundCurrency(toNumber(current));
	const safePrevious = roundCurrency(toNumber(previous));
	const delta = roundCurrency(safeCurrent - safePrevious);
	const changePercent =
		safePrevious > 0
			? roundPercent((delta / safePrevious) * 100)
			: safeCurrent > 0
				? null
				: 0;

	return {
		current: safeCurrent,
		previous: safePrevious,
		delta,
		changePercent,
	};
};

const buildCountComparison = (current: number, previous: number): CountComparison => {
	const safeCurrent = Math.max(0, Math.trunc(toNumber(current)));
	const safePrevious = Math.max(0, Math.trunc(toNumber(previous)));
	const delta = safeCurrent - safePrevious;
	const changePercent =
		safePrevious > 0
			? roundPercent((delta / safePrevious) * 100)
			: safeCurrent > 0
				? null
				: 0;

	return {
		current: safeCurrent,
		previous: safePrevious,
		delta,
		changePercent,
	};
};

const safeRate = (numerator: number, denominator: number) => {
	const safeDenominator = Math.max(0, toNumber(denominator));
	if (safeDenominator <= 0) return null;
	return roundPercent((toNumber(numerator) / safeDenominator) * 100);
};

export const dashboardMetrics: PageHandler = async () => {
	const now = new Date();
	const todayStart = startOfToday(now);
	const trendDays = 14;
	const trendStart = startOfDaysAgo(todayStart, trendDays);
	const last7DaysStart = startOfDaysAgo(todayStart, 7);
	const previous7DaysStart = startOfDaysAgo(todayStart, 14);
	const last30DaysStart = startOfDaysAgo(todayStart, 30);
	const previous30DaysStart = startOfDaysAgo(todayStart, 60);

	const [
		salesTodayAgg,
		salesTrendAgg,
		ordersTrendAgg,
		sales7DaysAgg,
		sales7DaysPrevAgg,
		sales30DaysAgg,
		sales30DaysPrevAgg,
		paidOrders7Days,
		paidOrders7DaysPrev,
		paidOrders30Days,
		paidOrders30DaysPrev,
		newUsers7Days,
		newUsers7DaysPrev,
		newSubscribers7Days,
		newSubscribers7DaysPrev,
		totalSubscribers,
		refunds30DaysAgg,
		statusCounts,
		topProductsAgg,
		orderDiscount30DaysAgg,
		discountedOrderGroups,
		couponOrderGroups,
		totalOrders30Days,
		fulfillmentSamples,
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
			where: {
				status: { in: [...paidStatuses] },
				createdAt: { gte: previous7DaysStart, lt: last7DaysStart },
			},
			_sum: { total: true },
		}),
		prisma.order.aggregate({
			where: { status: { in: [...paidStatuses] }, createdAt: { gte: last30DaysStart } },
			_sum: { total: true },
		}),
		prisma.order.aggregate({
			where: {
				status: { in: [...paidStatuses] },
				createdAt: { gte: previous30DaysStart, lt: last30DaysStart },
			},
			_sum: { total: true },
		}),
		prisma.order.count({
			where: { status: { in: [...paidStatuses] }, createdAt: { gte: last7DaysStart } },
		}),
		prisma.order.count({
			where: {
				status: { in: [...paidStatuses] },
				createdAt: { gte: previous7DaysStart, lt: last7DaysStart },
			},
		}),
		prisma.order.count({
			where: { status: { in: [...paidStatuses] }, createdAt: { gte: last30DaysStart } },
		}),
		prisma.order.count({
			where: {
				status: { in: [...paidStatuses] },
				createdAt: { gte: previous30DaysStart, lt: last30DaysStart },
			},
		}),
		prisma.user.count({ where: { createdAt: { gte: last7DaysStart } } }),
		prisma.user.count({ where: { createdAt: { gte: previous7DaysStart, lt: last7DaysStart } } }),
		prisma.newsletterSubscription.count({ where: { createdAt: { gte: last7DaysStart } } }),
		prisma.newsletterSubscription.count({
			where: { createdAt: { gte: previous7DaysStart, lt: last7DaysStart } },
		}),
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
		prisma.orderDiscount.aggregate({
			where: {
				order: {
					status: { in: [...paidStatuses] },
					createdAt: { gte: last30DaysStart },
				},
			},
			_sum: { amount: true },
		}),
		prisma.orderDiscount.groupBy({
			by: ['orderId'],
			where: {
				order: {
					status: { in: [...paidStatuses] },
					createdAt: { gte: last30DaysStart },
				},
			},
			orderBy: { orderId: 'asc' },
		}),
		prisma.orderDiscount.groupBy({
			by: ['orderId'],
			where: {
				couponId: { not: null },
				order: {
					status: { in: [...paidStatuses] },
					createdAt: { gte: last30DaysStart },
				},
			},
			orderBy: { orderId: 'asc' },
		}),
		prisma.order.count({ where: { createdAt: { gte: last30DaysStart } } }),
		prisma.order.findMany({
			where: {
				createdAt: { gte: last30DaysStart },
				status: { in: ['SHIPPED', 'DELIVERED'] },
			},
			select: { createdAt: true, updatedAt: true },
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

	const sales30 = roundCurrency(toNumber(sales30DaysAgg._sum?.total));
	const sales30Prev = roundCurrency(toNumber(sales30DaysPrevAgg._sum?.total));
	const sales7 = roundCurrency(toNumber(sales7DaysAgg._sum?.total));
	const sales7Prev = roundCurrency(toNumber(sales7DaysPrevAgg._sum?.total));
	const paidOrders30 = Math.max(0, Math.trunc(toNumber(paidOrders30Days)));
	const paidOrders30Prev = Math.max(0, Math.trunc(toNumber(paidOrders30DaysPrev)));
	const paidOrders7 = Math.max(0, Math.trunc(toNumber(paidOrders7Days)));
	const paidOrders7Prev = Math.max(0, Math.trunc(toNumber(paidOrders7DaysPrev)));

	const refundsAmount30 = roundCurrency(toNumber(refunds30DaysAgg._sum?.refundAmount));
	const refundsCount30 = Math.max(0, Math.trunc(toNumber(refunds30DaysAgg._count?._all)));
	const discountAmount30 = roundCurrency(toNumber(orderDiscount30DaysAgg._sum?.amount));
	const discountedOrders30 = discountedOrderGroups.length;
	const couponOrders30 = couponOrderGroups.length;

	const deliveredCount = statusMap.get('DELIVERED') ?? 0;
	const shippedCountRaw = statusMap.get('SHIPPED') ?? 0;
	const shippedOrBeyondCount = shippedCountRaw + deliveredCount;
	const createdCount = Math.max(0, Math.trunc(toNumber(totalOrders30Days)));
	const pendingCount = statusMap.get('PENDING') ?? 0;
	const cancelledCount = statusMap.get('CANCELLED') ?? 0;
	const returnedCount = statusMap.get('RETURNED') ?? 0;

	const fulfillmentDurationsHours = fulfillmentSamples
		.map((sample) =>
			(sample.updatedAt.getTime() - sample.createdAt.getTime()) / (1000 * 60 * 60)
		)
		.filter((hours) => Number.isFinite(hours) && hours >= 0);
	const avgFulfillmentHours =
		fulfillmentDurationsHours.length > 0
			? roundPercent(
					fulfillmentDurationsHours.reduce((sum, hours) => sum + hours, 0) /
						fulfillmentDurationsHours.length
				)
			: null;

	return {
		payload: {
			sales: {
				today: roundCurrency(toNumber(salesTodayAgg._sum?.total)),
				last7Days: sales7,
				last30Days: sales30,
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
					count: refundsCount30,
					amount: refundsAmount30,
				},
			},
			periodComparison: {
				sales7Days: buildMoneyComparison(sales7, sales7Prev),
				sales30Days: buildMoneyComparison(sales30, sales30Prev),
				paidOrders7Days: buildCountComparison(paidOrders7, paidOrders7Prev),
				paidOrders30Days: buildCountComparison(paidOrders30, paidOrders30Prev),
				newUsers7Days: buildCountComparison(
					Math.max(0, Math.trunc(toNumber(newUsers7Days))),
					Math.max(0, Math.trunc(toNumber(newUsers7DaysPrev)))
				),
				newSubscribers7Days: buildCountComparison(
					Math.max(0, Math.trunc(toNumber(newSubscribers7Days))),
					Math.max(0, Math.trunc(toNumber(newSubscribers7DaysPrev)))
				),
			},
			netRevenue: {
				sales: sales30,
				discounts: discountAmount30,
				refunds: refundsAmount30,
				net: roundCurrency(sales30 - refundsAmount30),
			},
			funnel: {
				created: createdCount,
				pending: pendingCount,
				paid: paidOrders30,
				shipped: shippedOrBeyondCount,
				delivered: deliveredCount,
				paidRate: safeRate(paidOrders30, createdCount),
				shippedFromPaidRate: safeRate(shippedOrBeyondCount, paidOrders30),
				deliveredFromShippedRate: safeRate(deliveredCount, shippedOrBeyondCount),
				deliveredRate: safeRate(deliveredCount, createdCount),
			},
			orderHealth: {
				cancelRate: safeRate(cancelledCount, createdCount),
				returnRate: safeRate(returnedCount, createdCount),
				refundRate: safeRate(refundsCount30, paidOrders30),
				avgFulfillmentHours,
				fulfillmentSampleSize: fulfillmentDurationsHours.length,
			},
			promotionEffectiveness: {
				discountedOrders: discountedOrders30,
				discountedOrdersShare: safeRate(discountedOrders30, paidOrders30),
				couponOrders: couponOrders30,
				couponOrdersShare: safeRate(couponOrders30, paidOrders30),
				discountAmount: discountAmount30,
				averageDiscountAmount:
					discountedOrders30 > 0 ? roundCurrency(discountAmount30 / discountedOrders30) : 0,
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
