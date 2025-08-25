'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { leaveFeedback } from '@/actions/feedback/leaveFeedback';
import { FeedbackSchema } from 'formValidationSchemas/feedbackSchema';
import { Review } from '@/types/product';
import { useSession } from './SessionProvider';
import { removeFeedback } from '@/actions/feedback/removeFeedback';

type ReviewContextType = {
	reviews: Review[];
	handleReviewAction: (formData: FeedbackSchema) => Promise<{ success: boolean }>;
	handleRemoveAction: () => Promise<{ success: boolean }>;
};

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

type Props = {
	initialReviews: Review[];
	productId: string;
	children: React.ReactNode;
};

export function ReviewProvider({ initialReviews, productId, children }: Props) {
	const [reviews, setReviews] = useState<Review[]>(initialReviews);
	const { session } = useSession();
	const userId = session?.user?.id;

	const handleReviewAction = useCallback(
		async (formData: FeedbackSchema): Promise<{ success: boolean }> => {
			if (!userId) return { success: false };

			const prevReviews = [...reviews];
			const existingReviewIndex = reviews.findIndex((r) => r.user.id === userId);

			const optimisticReview: Review = {
				id: existingReviewIndex !== -1 ? reviews[existingReviewIndex].id : `temp-${Date.now()}`,
				rating: formData.rating,
				comment: formData.feedback,
				advantages: formData.advantages ?? null,
				disadvantages: formData.disAdvantages ?? null,
				createdAt: new Date(),
				user: {
					id: userId,
					name: formData.name,
					lastName: formData.lastName ?? null,
				},
			};

			setReviews((prev) => {
				if (existingReviewIndex !== -1) {
					const updated = [...prev];
					updated[existingReviewIndex] = optimisticReview;
					return updated;
				}
				return [optimisticReview, ...prev];
			});

			try {
				const result = await leaveFeedback(null, formData, productId);
				if (!result.success) {
					setReviews(prevReviews);
					return { success: false };
				}
				return { success: true };
			} catch {
				setReviews(prevReviews);
				return { success: false };
			}
		},
		[reviews, productId, userId]
	);

	const handleRemoveAction = useCallback(async (): Promise<{ success: boolean }> => {
		if (!userId) return { success: false };

		const prevReviews = [...reviews];
		const updated = reviews.filter((r) => r.user.id !== userId);
		setReviews(updated);

		try {
			const result = await removeFeedback(productId);
			if (!result.success) {
				setReviews(prevReviews);
				return { success: false };
			}
			return { success: true };
		} catch {
			setReviews(prevReviews);
			return { success: false };
		}
	}, [reviews, productId, userId]);

	return (
		<ReviewContext.Provider value={{ reviews, handleReviewAction, handleRemoveAction }}>
			{children}
		</ReviewContext.Provider>
	);
}

export function useReviews() {
	const context = useContext(ReviewContext);
	if (!context) throw new Error('useReviews must be used within a ReviewProvider');
	return context;
}
