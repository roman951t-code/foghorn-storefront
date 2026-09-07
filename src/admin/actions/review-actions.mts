import type { ActionHandler, RecordActionResponse } from 'adminjs';
import { prisma } from '../prisma.mts';

type ReviewProductPayload = {
	productId: string;
	productName: string;
	productImageUrl: string | null;
	productStatus: string;
};

export const reviewProductSummary: ActionHandler<RecordActionResponse> = async (_req, _res, context) => {
	const { record, currentAdmin } = context;
	if (!record) {
		throw new Error('Missing record context');
	}

	const reviewId = record.param('id') as string;
	const review = await prisma.review.findUnique({
		where: { id: reviewId },
		select: {
			productId: true,
			product: { select: { name: true, imageUrl: true, status: true } },
		},
	});

	const payload: ReviewProductPayload = {
		productId: review?.productId ?? '',
		productName: review?.product?.name ?? '-',
		productImageUrl: review?.product?.imageUrl ?? null,
		productStatus: review?.product?.status ? String(review.product.status) : '-',
	};

	return {
		record: record.toJSON(currentAdmin),
		payload,
	};
};
