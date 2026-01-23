import type { ActionHandler, RecordActionResponse } from 'adminjs';
import { prisma } from '../prisma.mts';

type RelatedOrder = {
	id: string;
	status: string;
	total: number;
	createdAt: string;
};

type RelatedReview = {
	id: string;
	rating: number;
	comment: string;
	createdAt: string;
	productId: string;
	productName: string;
};

type RelatedProductRef = {
	productId: string;
	productName: string;
	createdAt: string;
};

type UserRelatedPayload = {
	orders: RelatedOrder[];
	reviews: RelatedReview[];
	wishlist: RelatedProductRef[];
	recentlyViewed: RelatedProductRef[];
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

export const userRelatedData: ActionHandler<RecordActionResponse> = async (_req, _res, context) => {
	const { record, currentAdmin } = context;
	if (!record) {
		throw new Error('Missing record context');
	}

	const userId = record.param('id') as string;

	const [orders, reviews, wishlist, recentlyViewed] = await Promise.all([
		prisma.order.findMany({
			where: { userId },
			orderBy: { createdAt: 'desc' },
			select: { id: true, status: true, total: true, createdAt: true },
			take: previewLimit,
		}),
		prisma.review.findMany({
			where: { userId },
			orderBy: { createdAt: 'desc' },
			select: {
				id: true,
				rating: true,
				comment: true,
				createdAt: true,
				productId: true,
				product: { select: { name: true } },
			},
			take: previewLimit,
		}),
		prisma.wishlist.findMany({
			where: { userId },
			orderBy: { createdAt: 'desc' },
			select: { createdAt: true, productId: true, product: { select: { name: true } } },
			take: previewLimit,
		}),
		prisma.recentlyViewed.findMany({
			where: { userId },
			orderBy: { updatedAt: 'desc' },
			select: { updatedAt: true, productId: true, product: { select: { name: true } } },
			take: previewLimit,
		}),
	]);

	const payload: UserRelatedPayload = {
		orders: orders.map((order) => ({
			id: order.id,
			status: String(order.status),
			total: toNumber(order.total),
			createdAt: order.createdAt.toISOString(),
		})),
		reviews: reviews.map((review) => ({
			id: review.id,
			rating: review.rating,
			comment: review.comment,
			createdAt: review.createdAt.toISOString(),
			productId: review.productId,
			productName: review.product?.name ?? '-',
		})),
		wishlist: wishlist.map((item) => ({
			productId: item.productId,
			productName: item.product?.name ?? '-',
			createdAt: item.createdAt.toISOString(),
		})),
		recentlyViewed: recentlyViewed.map((item) => ({
			productId: item.productId,
			productName: item.product?.name ?? '-',
			createdAt: item.updatedAt.toISOString(),
		})),
	};

	return {
		record: record.toJSON(currentAdmin),
		payload,
	};
};

