'use client';

import { useEffect, useMemo } from 'react';
import type { FeedbackSchema } from 'formValidationSchemas/feedbackSchema';
import type { Review } from '@/types/product';
import { useSession } from './SessionProvider';
import { useReviewStore } from '@/stores/reviewStore';

const emptyReviews: Review[] = [];

export function useInitReviews(productId: string, initialReviews: Review[]) {
	const setActiveProduct = useReviewStore((state) => state.setActiveProduct);
	const setReviews = useReviewStore((state) => state.setReviews);
	const clearActiveProduct = useReviewStore((state) => state.clearActiveProduct);

	useEffect(() => {
		setActiveProduct(productId);
		setReviews(productId, initialReviews);
		return () => clearActiveProduct(productId);
	}, [clearActiveProduct, initialReviews, productId, setActiveProduct, setReviews]);
}

export function useReviews() {
	const { session } = useSession();
	const userId = session?.user?.id;
	const activeProductId = useReviewStore((state) => state.activeProductId);
	const reviews = useReviewStore((state) =>
		activeProductId ? state.reviewsByProduct[activeProductId] || emptyReviews : emptyReviews
	);
	const handleReviewAction = useReviewStore((state) => state.handleReviewAction);
	const handleRemoveAction = useReviewStore((state) => state.handleRemoveAction);

	return useMemo(
		() => ({
			reviews,
			handleReviewAction: (formData: FeedbackSchema) =>
				activeProductId
					? handleReviewAction(activeProductId, formData, userId)
					: Promise.resolve({ success: false }),
			handleRemoveAction: () =>
				activeProductId ? handleRemoveAction(activeProductId, userId) : Promise.resolve({ success: false }),
		}),
		[activeProductId, handleRemoveAction, handleReviewAction, reviews, userId]
	);
}
