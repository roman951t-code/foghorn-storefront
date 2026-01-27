import type { ActionHandler, ActionResponse } from 'adminjs';
import { prisma } from '../prisma.mts';

const paidStatuses = ['PAID', 'SHIPPED', 'DELIVERED'] as const;
const salesWindowDays = 30;

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

const parseThreshold = (value: unknown, fallback: number) => {
	const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
	if (!Number.isFinite(parsed)) return fallback;
	return Math.max(0, Math.trunc(parsed));
};

const parseLimit = (value: unknown, fallback: number) => {
	const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
	if (!Number.isFinite(parsed)) return fallback;
	const normalized = Math.trunc(parsed);
	return Math.max(5, Math.min(50, normalized));
};

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

export const lowStockAlerts: ActionHandler<ActionResponse> = async (req, _res, _context) => {
	const payload = (req as { payload?: Record<string, unknown> }).payload ?? {};
	const defaultLow = parseThreshold(process.env.ADMIN_LOW_STOCK_THRESHOLD, 5);
	const defaultCritical = parseThreshold(process.env.ADMIN_CRITICAL_STOCK_THRESHOLD, 2);
	const lowThreshold = parseThreshold(payload.lowThreshold, defaultLow);
	const criticalThreshold = parseThreshold(payload.criticalThreshold, defaultCritical);
	const limit = parseLimit(payload.limit, 20);
	const outOfStockLimit = parseLimit(payload.outOfStockLimit, 8);
	const topProductsLimit = parseLimit(payload.topProductsLimit, 5);

	const now = new Date();
	const salesWindowStart = startOfDaysAgo(startOfToday(now), salesWindowDays);

	const normalizedLow = Math.max(lowThreshold, criticalThreshold);
	const normalizedCritical = Math.min(normalizedLow, criticalThreshold);

	const activeProductWhere = {
		status: { not: 'ARCHIVED' },
	} as const;

	const lowStockWhere = {
		...activeProductWhere,
		stock: { lte: normalizedLow },
	} as const;

	const [criticalCount, lowCount, outOfStockCount, products, outOfStockItems, topProductsAgg] =
		await prisma.$transaction([
			prisma.product.count({ where: { ...lowStockWhere, stock: { lte: normalizedCritical } } }),
			prisma.product.count({
				where: {
					...lowStockWhere,
					stock: { lte: normalizedLow, gt: normalizedCritical },
				},
			}),
			prisma.product.count({ where: { ...activeProductWhere, stock: { lte: 0 } } }),
			prisma.product.findMany({
				where: lowStockWhere,
				orderBy: [{ stock: 'asc' }, { updatedAt: 'desc' }],
				take: limit,
				select: {
					id: true,
					name: true,
					imageUrl: true,
					stock: true,
					inStock: true,
					status: true,
					updatedAt: true,
				},
			}),
			prisma.product.findMany({
				where: { ...activeProductWhere, stock: { lte: 0 } },
				orderBy: [{ updatedAt: 'desc' }],
				take: outOfStockLimit,
				select: {
					id: true,
					name: true,
					imageUrl: true,
					stock: true,
					inStock: true,
					status: true,
					updatedAt: true,
				},
			}),
			prisma.orderItem.groupBy({
				by: ['productId'],
				where: {
					order: { status: { in: [...paidStatuses] }, createdAt: { gte: salesWindowStart } },
				},
				_sum: { quantity: true, price: true },
				orderBy: { _sum: { quantity: 'desc' } },
				take: topProductsLimit,
			}),
		]);

	const topProductIds = topProductsAgg.map((item) => item.productId);
	const topProductNames = topProductIds.length
		? await prisma.product.findMany({
				where: { id: { in: topProductIds } },
				select: { id: true, name: true },
			})
		: [];
	const topProductNameMap = new Map(topProductNames.map((product) => [product.id, product.name]));

	return {
		payload: {
			config: {
				lowThreshold: normalizedLow,
				criticalThreshold: normalizedCritical,
				limit,
				outOfStockLimit,
				topProductsLimit,
				topProductsRangeDays: salesWindowDays,
			},
			counts: {
				critical: criticalCount,
				low: lowCount,
				outOfStock: outOfStockCount,
			},
			items: products.map((product) => ({
				id: product.id,
				name: product.name,
				imageUrl: product.imageUrl ?? null,
				stock: product.stock,
				inStock: product.inStock,
				status: product.status,
				updatedAt: product.updatedAt.toISOString(),
			})),
			outOfStock: {
				items: outOfStockItems.map((product) => ({
					id: product.id,
					name: product.name,
					imageUrl: product.imageUrl ?? null,
					stock: product.stock,
					inStock: product.inStock,
					status: product.status,
					updatedAt: product.updatedAt.toISOString(),
				})),
			},
			topProducts: {
				rangeDays: salesWindowDays,
				items: topProductsAgg.map((item) => ({
					productId: item.productId,
					name: topProductNameMap.get(item.productId) ?? 'Unknown product',
					quantity: Number(item._sum.quantity ?? 0),
					revenue: roundCurrency(Number(item._sum.price ?? 0)),
				})),
			},
		},
	};
};
