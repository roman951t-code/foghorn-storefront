'use client';

import { useEffect } from 'react';
import { useSession } from '@/providers/SessionProvider';
import { useReviewStore } from '@/stores/reviewStore';
import type { Review } from '@/types/product';

type ProductPersonalizationResponse = {
	success?: boolean;
	ownReview?: Review | null;
};

type Props = {
	productId: string;
	reviews: Review[];
};

const normalizeReview = (review: Review): Review => ({
	...review,
	createdAt: new Date(review.createdAt),
});

const personalizeReviews = (reviews: Review[], ownReview?: Review | null) => {
	const normalizedOwnReview = ownReview ? normalizeReview({ ...ownReview, isMine: true }) : null;
	let matchedOwnReview = false;

	const nextReviews = reviews.map((review) => {
		const isMine = Boolean(normalizedOwnReview && review.id === normalizedOwnReview.id);
		if (isMine) matchedOwnReview = true;
		return normalizeReview({ ...review, isMine });
	});

	if (normalizedOwnReview && !matchedOwnReview) {
		return [normalizedOwnReview, ...nextReviews];
	}

	return nextReviews;
};

export default function ProductPersonalization({ productId, reviews }: Props) {
	const { session } = useSession();
	const userId = session?.user?.id;
	const setReviews = useReviewStore((state) => state.setReviews);

	useEffect(() => {
		if (!userId) {
			const currentReviews = useReviewStore.getState().reviewsByProduct[productId] ?? reviews;
			setReviews(productId, personalizeReviews(currentReviews, null));
			return;
		}

		let cancelled = false;

		const personalizeProduct = async () => {
			try {
				const res = await fetch(`/api/products/${encodeURIComponent(productId)}/personalization`, {
					method: 'POST',
					cache: 'no-store',
				});

				if (!res.ok) return;

				const data = (await res.json()) as ProductPersonalizationResponse;
				if (cancelled || !data?.success) return;

				const currentReviews = useReviewStore.getState().reviewsByProduct[productId] ?? reviews;
				setReviews(productId, personalizeReviews(currentReviews, data.ownReview ?? null));
			} catch {
				// Keep the public cached product data when private personalization fails.
			}
		};

		void personalizeProduct();

		return () => {
			cancelled = true;
		};
	}, [productId, reviews, setReviews, userId]);

	return null;
}
