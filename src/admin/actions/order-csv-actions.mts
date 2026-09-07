import type { ActionHandler, ActionResponse } from 'adminjs';
import type { Prisma } from '@prisma/client';
import { prisma } from '../prisma.mts';
import { buildCsvFromRows } from '../utils/csv.mts';

type FilterValue = string | number | boolean | Record<string, unknown> | Array<string | number>;

const toNumber = (value: unknown): number | null => {
	if (typeof value === 'number') return Number.isFinite(value) ? value : null;
	if (typeof value === 'bigint') return Number(value);
	if (typeof value === 'string') {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : null;
	}
	if (value && typeof value === 'object' && 'toNumber' in value && typeof (value as any).toNumber === 'function') {
		const parsed = (value as any).toNumber();
		return Number.isFinite(parsed) ? parsed : null;
	}
	return null;
};

const parseMaybeJson = (value: unknown): unknown => {
	if (typeof value !== 'string') return value;
	const trimmed = value.trim();
	if (!trimmed) return '';
	if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
		try {
			return JSON.parse(trimmed);
		} catch {
			return value;
		}
	}
	return value;
};

const normalizeFilters = (raw: unknown): Record<string, FilterValue> => {
	if (!raw) return {};
	if (typeof raw === 'string') {
		const parsed = parseMaybeJson(raw);
		if (parsed && typeof parsed === 'object') return normalizeFilters(parsed);
		return {};
	}
	if (typeof raw !== 'object') return {};
	const entries = Object.entries(raw as Record<string, unknown>);
	const result: Record<string, FilterValue> = {};
	for (const [key, value] of entries) {
		if (!key) continue;
		const normalized = parseMaybeJson(value);
		if (normalized === '' || normalized == null) continue;
		result[key] = normalized as FilterValue;
	}
	return result;
};

const extractFiltersFromRequest = (req: unknown): Record<string, FilterValue> => {
	const request = req as { payload?: Record<string, unknown>; query?: Record<string, unknown> };
	const payload = request.payload ?? {};
	if (payload && typeof payload === 'object' && 'filters' in payload) {
		return normalizeFilters((payload as { filters?: unknown }).filters);
	}
	const query = request.query ?? {};
	if (query && typeof query === 'object') {
		if ('filters' in query) {
			return normalizeFilters((query as { filters?: unknown }).filters);
		}
		const collected: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(query)) {
			if (key.startsWith('filters.')) {
				collected[key.slice('filters.'.length)] = value;
			}
		}
		return normalizeFilters(collected);
	}
	return {};
};

const parseDateRange = (value: FilterValue): { gte?: Date; lte?: Date } | null => {
	const parsed = parseMaybeJson(value);
	if (!parsed) return null;
	if (typeof parsed === 'object' && !Array.isArray(parsed)) {
		const obj = parsed as Record<string, unknown>;
		const gteRaw = obj.gte ?? obj.from ?? obj.start ?? obj.gt;
		const lteRaw = obj.lte ?? obj.to ?? obj.end ?? obj.lt;
		const gte = gteRaw ? new Date(String(gteRaw)) : null;
		const lte = lteRaw ? new Date(String(lteRaw)) : null;
		const range: { gte?: Date; lte?: Date } = {};
		if (gte && !Number.isNaN(gte.getTime())) range.gte = gte;
		if (lte && !Number.isNaN(lte.getTime())) range.lte = lte;
		return Object.keys(range).length ? range : null;
	}
	if (typeof parsed === 'string') {
		const trimmed = parsed.trim();
		if (!trimmed) return null;
		const date = new Date(trimmed);
		if (Number.isNaN(date.getTime())) return null;
		if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
			const start = new Date(`${trimmed}T00:00:00.000Z`);
			const end = new Date(start);
			end.setUTCDate(end.getUTCDate() + 1);
			return { gte: start, lte: end };
		}
		return { gte: date };
	}
	return null;
};

const parseNumberRange = (value: FilterValue): { gte?: number; lte?: number } | null => {
	const parsed = parseMaybeJson(value);
	if (typeof parsed === 'object' && parsed && !Array.isArray(parsed)) {
		const obj = parsed as Record<string, unknown>;
		const gte = toNumber(obj.gte ?? obj.from ?? obj.start ?? obj.gt);
		const lte = toNumber(obj.lte ?? obj.to ?? obj.end ?? obj.lt);
		const range: { gte?: number; lte?: number } = {};
		if (gte != null) range.gte = gte;
		if (lte != null) range.lte = lte;
		return Object.keys(range).length ? range : null;
	}
	const num = toNumber(parsed);
	return num != null ? { gte: num, lte: num } : null;
};

const parseStringCondition = (value: FilterValue): Prisma.StringFilter | undefined => {
	const parsed = parseMaybeJson(value);
	if (typeof parsed === 'string') {
		const trimmed = parsed.trim();
		if (!trimmed) return undefined;
		return { contains: trimmed, mode: 'insensitive' };
	}
	if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
		const obj = parsed as Record<string, unknown>;
		const condition: Prisma.StringFilter = {};
		if (typeof obj.contains === 'string') condition.contains = obj.contains;
		if (typeof obj.equals === 'string') condition.equals = obj.equals;
		if (typeof obj.startsWith === 'string') condition.startsWith = obj.startsWith;
		if (typeof obj.endsWith === 'string') condition.endsWith = obj.endsWith;
		if (Array.isArray(obj.in)) condition.in = obj.in.filter((item) => typeof item === 'string') as string[];
		if (!('equals' in condition) && !('startsWith' in condition) && !('endsWith' in condition)) {
			condition.mode = 'insensitive';
		}
		return Object.keys(condition).length ? condition : undefined;
	}
	return undefined;
};

const buildOrderWhere = (filters: Record<string, FilterValue>): Prisma.OrderWhereInput => {
	const where: Prisma.OrderWhereInput = {};
	const and: Prisma.OrderWhereInput[] = [];

	const status = filters.status;
	if (typeof status === 'string' && status.trim()) {
		and.push({ status: status.trim() as any });
	} else if (Array.isArray(status)) {
		const values = status.filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
		if (values.length) and.push({ status: { in: values as any } });
	}

	const paymentMethod = filters.paymentMethod;
	if (typeof paymentMethod === 'string' && paymentMethod.trim()) {
		and.push({ paymentMethod: paymentMethod.trim() });
	} else if (Array.isArray(paymentMethod)) {
		const values = paymentMethod.filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
		if (values.length) and.push({ paymentMethod: { in: values } });
	}

	const shipmentMethod = filters.shipmentMethod;
	if (typeof shipmentMethod === 'string' && shipmentMethod.trim()) {
		and.push({ shipmentMethod: shipmentMethod.trim() });
	} else if (Array.isArray(shipmentMethod)) {
		const values = shipmentMethod.filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
		if (values.length) and.push({ shipmentMethod: { in: values } });
	}

	const totalRange = filters.total ? parseNumberRange(filters.total) : null;
	if (totalRange) {
		and.push({ total: totalRange });
	}

	const createdAtRange = filters.createdAt ? parseDateRange(filters.createdAt) : null;
	if (createdAtRange) {
		and.push({ createdAt: createdAtRange });
	}

	const customerName = parseStringCondition(filters.customerName);
	if (customerName) and.push({ customerName });

	const shippingAddress = parseStringCondition(filters.shippingAddress);
	if (shippingAddress) and.push({ shippingAddress });

	const shippingAddressLine1 = parseStringCondition(filters.shippingAddressLine1);
	if (shippingAddressLine1) and.push({ shippingAddressLine1 });

	const shippingAddressLine2 = parseStringCondition(filters.shippingAddressLine2);
	if (shippingAddressLine2) and.push({ shippingAddressLine2 });

	const shippingCity = parseStringCondition(filters.shippingCity);
	if (shippingCity) and.push({ shippingCity });

	const shippingRegion = parseStringCondition(filters.shippingRegion);
	if (shippingRegion) and.push({ shippingRegion });

	const shippingPostalCode = parseStringCondition(filters.shippingPostalCode);
	if (shippingPostalCode) and.push({ shippingPostalCode });

	const shippingCountry = parseStringCondition(filters.shippingCountry);
	if (shippingCountry) and.push({ shippingCountry });

	const contactEmail = parseStringCondition(filters.contactEmail);
	if (contactEmail) and.push({ contactEmail });

	const contactPhone = parseStringCondition(filters.contactPhone);
	if (contactPhone) and.push({ contactPhone });

	if (and.length) where.AND = and;
	return where;
};

const ORDER_HEADERS = [
	'id',
	'createdAt',
	'status',
	'total',
	'paymentMethod',
	'shipmentMethod',
	'shippingAddress',
	'shippingAddressLine1',
	'shippingAddressLine2',
	'shippingCity',
	'shippingRegion',
	'shippingPostalCode',
	'shippingCountry',
	'customerName',
	'contactEmail',
	'contactPhone',
	'carrier',
	'trackingNumber',
	'items',
];

export const exportOrdersCsv: ActionHandler<ActionResponse> = async (req) => {
	const filters = extractFiltersFromRequest(req);
	const where = buildOrderWhere(filters);
	const orders = await prisma.order.findMany({
		where,
		orderBy: { createdAt: 'desc' },
		select: {
			id: true,
			createdAt: true,
			status: true,
			total: true,
			paymentMethod: true,
			shipmentMethod: true,
			shippingAddress: true,
			shippingAddressLine1: true,
			shippingAddressLine2: true,
			shippingCity: true,
			shippingRegion: true,
			shippingPostalCode: true,
			shippingCountry: true,
			customerName: true,
			contactEmail: true,
			contactPhone: true,
			carrier: true,
			trackingNumber: true,
			items: {
				select: {
					quantity: true,
					productId: true,
					snapshotProductName: true,
					product: { select: { name: true, productCode: true } },
				},
			},
		},
	});

	const rows: string[][] = [ORDER_HEADERS];
	for (const order of orders) {
		const items = order.items
			.map((item) => {
				const label =
					item.snapshotProductName?.trim() ||
					item.product?.name?.trim() ||
					item.product?.productCode?.trim() ||
					item.productId;
				return `${label} x${item.quantity}`;
			})
			.join(' | ');
		rows.push([
			order.id,
			order.createdAt.toISOString(),
			String(order.status ?? ''),
			order.total?.toNumber?.() != null ? String(order.total.toNumber()) : '',
			order.paymentMethod ?? '',
			order.shipmentMethod ?? '',
			order.shippingAddress ?? '',
			order.shippingAddressLine1 ?? '',
			order.shippingAddressLine2 ?? '',
			order.shippingCity ?? '',
			order.shippingRegion ?? '',
			order.shippingPostalCode ?? '',
			order.shippingCountry ?? '',
			order.customerName ?? '',
			order.contactEmail ?? '',
			order.contactPhone ?? '',
			order.carrier ?? '',
			order.trackingNumber ?? '',
			items,
		]);
	}

	return {
		notice: {
			message: 'order-csv-export-complete',
			type: 'success',
			options: { count: orders.length },
		},
		payload: {
			csv: buildCsvFromRows(rows),
			filename: `orders-${new Date().toISOString().slice(0, 10)}.csv`,
		},
	};
};
