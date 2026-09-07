import type { ActionHandler, ActionResponse } from 'adminjs';
import { prisma } from '../prisma.mts';

type SegmentUser = {
	id: string;
	name: string;
	email: string | null;
	emailVerified: boolean;
	subscribed: boolean;
	createdAt: string;
	lastOrderAt: string | null;
	lifetimeValue: number | null;
};

type SegmentsPayload = {
	config: {
		inactiveDays: number;
		highSpenderMinLtv: number;
		previewLimit: number;
	};
	counts: {
		subscribed: number;
		verified: number;
		unverified: number;
		inactive: number;
		highSpenders: number | null;
	};
	lists: {
		subscribed: SegmentUser[];
		verified: SegmentUser[];
		unverified: SegmentUser[];
		inactive: SegmentUser[];
		highSpenders: SegmentUser[];
	};
};

const paidStatuses = ['PAID', 'SHIPPED', 'DELIVERED'] as const;

const parseNumberEnv = (value: string | undefined, fallback: number) => {
	if (!value) return fallback;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
};

const toNumber = (value: unknown): number => {
	if (typeof value === 'number') return value;
	if (typeof value === 'bigint') return Number(value);
	if (typeof value === 'string') return Number(value);
	if (value && typeof value === 'object' && 'toNumber' in value && typeof (value as any).toNumber === 'function') {
		return (value as any).toNumber();
	}
	return Number(value);
};

const baseUserSelect = {
	id: true,
	name: true,
	email: true,
	emailVerified: true,
	subscribed: true,
	createdAt: true,
} as const;

export const userSegments: ActionHandler<ActionResponse> = async (_req, _res, _context) => {
	const inactiveDays = parseNumberEnv(process.env.ADMIN_SEGMENT_INACTIVE_DAYS, 90);
	const highSpenderMinLtv = parseNumberEnv(process.env.ADMIN_SEGMENT_HIGH_SPENDER_MIN_LTV, 5000);
	const previewLimit = parseNumberEnv(process.env.ADMIN_SEGMENT_PREVIEW_LIMIT, 25);
	const cutoff = new Date(Date.now() - inactiveDays * 24 * 60 * 60 * 1000);

	const [
		subscribedCount,
		verifiedCount,
		unverifiedCount,
		inactiveCount,
		subscribedUsers,
		verifiedUsers,
		unverifiedUsers,
		inactiveUsers,
	] = await Promise.all([
		prisma.user.count({ where: { subscribed: true } }),
		prisma.user.count({ where: { emailVerified: true } }),
		prisma.user.count({ where: { emailVerified: false } }),
		prisma.user.count({ where: { orders: { none: { createdAt: { gt: cutoff } } } } }),
		prisma.user.findMany({
			where: { subscribed: true },
			select: baseUserSelect,
			orderBy: { updatedAt: 'desc' },
			take: previewLimit,
		}),
		prisma.user.findMany({
			where: { emailVerified: true },
			select: baseUserSelect,
			orderBy: { updatedAt: 'desc' },
			take: previewLimit,
		}),
		prisma.user.findMany({
			where: { emailVerified: false },
			select: baseUserSelect,
			orderBy: { updatedAt: 'desc' },
			take: previewLimit,
		}),
		prisma.user.findMany({
			where: { orders: { none: { createdAt: { gt: cutoff } } } },
			select: baseUserSelect,
			orderBy: { updatedAt: 'desc' },
			take: previewLimit,
		}),
	]);

	const inactiveIds = inactiveUsers.map((user) => user.id);
	const inactiveLastOrders = inactiveIds.length
		? await prisma.order.groupBy({
				by: ['userId'],
				where: { userId: { in: inactiveIds } },
				_max: { createdAt: true },
			})
		: [];
	const inactiveLastOrderMap = new Map(
		inactiveLastOrders.map((row) => [row.userId, row._max.createdAt ? row._max.createdAt.toISOString() : null])
	);

	let highSpendersCount: number | null = null;
	try {
		const rows = await prisma.$queryRaw<{ count: bigint }[]>`
			SELECT COUNT(*)::bigint AS count
			FROM (
				SELECT "userId"
				FROM "public"."Order"
				WHERE "status" IN ('PAID', 'SHIPPED', 'DELIVERED')
				GROUP BY "userId"
				HAVING SUM("total") >= ${highSpenderMinLtv}
			) t
		`;
		highSpendersCount = rows?.[0]?.count != null ? Number(rows[0].count) : null;
	} catch {
		highSpendersCount = null;
	}

	const highSpendersAgg = await prisma.order.groupBy({
		by: ['userId'],
		where: { status: { in: [...paidStatuses] } },
		_sum: { total: true },
		_max: { createdAt: true },
		orderBy: { _sum: { total: 'desc' } },
		take: Math.max(previewLimit * 5, 100),
	});

	const highSpendersFiltered = highSpendersAgg
		.map((row) => ({
			userId: row.userId,
			ltv: toNumber(row._sum.total ?? 0),
			lastOrderAt: row._max.createdAt ? row._max.createdAt.toISOString() : null,
		}))
		.filter((row) => row.ltv >= highSpenderMinLtv)
		.slice(0, previewLimit);

	const highSpenderIds = highSpendersFiltered.map((row) => row.userId);
	const highSpenderUsers = highSpenderIds.length
		? await prisma.user.findMany({
				where: { id: { in: highSpenderIds } },
				select: baseUserSelect,
			})
		: [];
	const highSpenderUserMap = new Map(highSpenderUsers.map((u) => [u.id, u]));

	const mapBase = (user: (typeof subscribedUsers)[number]): SegmentUser => ({
		id: user.id,
		name: user.name,
		email: user.email,
		emailVerified: user.emailVerified,
		subscribed: user.subscribed,
		createdAt: user.createdAt.toISOString(),
		lastOrderAt: null,
		lifetimeValue: null,
	});

	const payload: SegmentsPayload = {
		config: { inactiveDays, highSpenderMinLtv, previewLimit },
		counts: {
			subscribed: subscribedCount,
			verified: verifiedCount,
			unverified: unverifiedCount,
			inactive: inactiveCount,
			highSpenders: highSpendersCount,
		},
		lists: {
			subscribed: subscribedUsers.map(mapBase),
			verified: verifiedUsers.map(mapBase),
			unverified: unverifiedUsers.map(mapBase),
			inactive: inactiveUsers.map((user) => ({
				...mapBase(user),
				lastOrderAt: inactiveLastOrderMap.get(user.id) ?? null,
			})),
			highSpenders: highSpendersFiltered
				.map((row) => {
					const user = highSpenderUserMap.get(row.userId);
					if (!user) return null;
					return {
						...mapBase(user),
						lastOrderAt: row.lastOrderAt,
						lifetimeValue: row.ltv,
					};
				})
				.filter(Boolean) as SegmentUser[],
		},
	};

	return { payload };
};
