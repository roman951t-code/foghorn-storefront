import type { ActionHandler, RecordActionResponse } from 'adminjs';
import { prisma } from '../prisma.mts';

type RelatedOrderItem = {
	id: string;
	orderId: string;
	orderStatus: string;
	quantity: number;
	unitPrice: number;
	lineTotal: number;
	createdAt: string | null;
};

type RelatedReview = {
	id: string;
	rating: number;
	comment: string;
	createdAt: string | null;
	userId: string;
	userName: string;
};

type ProductRelatedPayload = {
	orderItems: RelatedOrderItem[];
	reviews: RelatedReview[];
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

const previewLimit = 10;

export const productRelatedData: ActionHandler<RecordActionResponse> = async (_req, _res, context) => {
	const { record, currentAdmin } = context;
	if (!record) {
		throw new Error('Missing record context');
	}

	const productId = record.param('id') as string;

	const [orderItems, reviews] = await Promise.all([
		prisma.orderItem.findMany({
			where: { productId },
			orderBy: { order: { createdAt: 'desc' } },
			select: {
				id: true,
				quantity: true,
				price: true,
				unitPrice: true,
				order: { select: { id: true, status: true, createdAt: true } },
			},
			take: previewLimit,
		}),
		prisma.review.findMany({
			where: { productId },
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				rating: true,
				comment: true,
				createdAt: true,
				userId: true,
				user: { select: { name: true } },
			},
			take: previewLimit,
		}),
	]);

	const payload: ProductRelatedPayload = {
		orderItems: orderItems.map((item) => ({
			id: item.id,
			orderId: item.order?.id ?? '-',
			orderStatus: item.order ? String(item.order.status) : '-',
			quantity: item.quantity,
			unitPrice: toNumber(item.unitPrice),
			lineTotal: toNumber(item.price),
			createdAt: item.order?.createdAt ? item.order.createdAt.toISOString() : null,
		})),
		reviews: reviews.map((review) => ({
			id: review.id,
			rating: review.rating,
			comment: review.comment,
			createdAt: review.createdAt.toISOString(),
			userId: review.userId,
			userName: review.user?.name ?? '-',
		})),
	};

	return {
		record: record.toJSON(currentAdmin),
		payload,
	};
};
