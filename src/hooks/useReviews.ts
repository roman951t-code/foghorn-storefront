'use client';

import { useEffect, useMemo } from 'react';
import type { FeedbackSchema } from 'validationSchemas/feedbackSchema';
import type { Review } from '@/types/product';
import { useSession } from '@/providers/SessionProvider';
import { useReviewStore } from '@/stores/reviewStore';

const emptyReviews: Review[] = [];

const mergeInitialReviews = (initialReviews: Review[], existingReviews?: Review[]) => {
	if (!existingReviews?.length) return initialReviews;

	const existingMineById = new Map(
		existingReviews.filter((review) => review.isMine).map((review) => [review.id, review]),
	);
	const mergedReviews = initialReviews.map((review) => ({
		...review,
		isMine: existingMineById.has(review.id) || review.isMine,
	}));
	const missingMineReviews = Array.from(existingMineById.values()).filter(
		(review) => !mergedReviews.some((mergedReview) => mergedReview.id === review.id),
	);

	return [...missingMineReviews, ...mergedReviews];
};

export function useInitReviews(productId: string, initialReviews: Review[]) {
	const setActiveProduct = useReviewStore((state) => state.setActiveProduct);
	const setReviews = useReviewStore((state) => state.setReviews);
	const clearActiveProduct = useReviewStore((state) => state.clearActiveProduct);

	useEffect(() => {
		setActiveProduct(productId);
		const existingReviews = useReviewStore.getState().reviewsByProduct[productId];
		setReviews(productId, mergeInitialReviews(initialReviews, existingReviews));
		return () => clearActiveProduct(productId);
	}, [clearActiveProduct, initialReviews, productId, setActiveProduct, setReviews]);
}

export function useReviews() {
	const { session } = useSession();
	const userId = session?.user?.id;
	const activeProductId = useReviewStore((state) => state.activeProductId);
	const reviews = useReviewStore((state) =>
		activeProductId ? state.reviewsByProduct[activeProductId] || emptyReviews : emptyReviews,
	);
	const handleReviewAction = useReviewStore((state) => state.handleReviewAction);
	const handleRemoveAction = useReviewStore((state) => state.handleRemoveAction);

	return useMemo(
		() => ({
			reviews,
			handleReviewAction: (formData: FeedbackSchema) =>
				activeProductId
					? handleReviewAction(activeProductId, formData, userId)
					: Promise.resolve({ success: false, review: undefined }),
			handleRemoveAction: () =>
				activeProductId
					? handleRemoveAction(activeProductId, userId)
					: Promise.resolve({ success: false }),
		}),
		[activeProductId, handleRemoveAction, handleReviewAction, reviews, userId],
	);
}
