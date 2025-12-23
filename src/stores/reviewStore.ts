'use client';

import { createBoundedStore } from './createBoundedStore';
import { leaveFeedback } from '@/actions/feedback/leaveFeedback';
import { removeFeedback } from '@/actions/feedback/removeFeedback';
import type { FeedbackSchema } from 'formValidationSchemas/feedbackSchema';
import type { Review } from '@/types/product';

type ReviewStore = {
	activeProductId?: string;
	reviewsByProduct: Record<string, Review[]>;
	setActiveProduct: (productId: string) => void;
	clearActiveProduct: (productId: string) => void;
	setReviews: (productId: string, reviews: Review[]) => void;
	handleReviewAction: (
		productId: string,
		formData: FeedbackSchema,
		userId?: string
	) => Promise<{ success: boolean; review?: Review }>;
	handleRemoveAction: (productId: string, userId?: string) => Promise<{ success: boolean }>;
};

export const useReviewStore = createBoundedStore<ReviewStore>((set, get) => ({
	activeProductId: undefined,
	reviewsByProduct: {},
	setActiveProduct: (productId) => set({ activeProductId: productId }),
	clearActiveProduct: (productId) =>
		set((state) => ({
			activeProductId: state.activeProductId === productId ? undefined : state.activeProductId,
		})),
	setReviews: (productId, reviews) =>
		set((state) => ({
			reviewsByProduct: {
				...state.reviewsByProduct,
				[productId]: reviews,
			},
		})),
	handleReviewAction: async (productId, formData, userId) => {
		if (!userId) return { success: false };

		const reviews = get().reviewsByProduct[productId] || [];
		const existingIndex = reviews.findIndex((r) => r.user.id === userId);
		const optimistic: Review = {
			id: existingIndex !== -1 ? reviews[existingIndex].id : `temp-${Date.now()}`,
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

		const nextReviews =
			existingIndex !== -1
				? reviews.map((r, idx) => (idx === existingIndex ? optimistic : r))
				: [optimistic, ...reviews];

		set((state) => ({
			reviewsByProduct: {
				...state.reviewsByProduct,
				[productId]: nextReviews,
			},
		}));

		try {
			const result = await leaveFeedback(null, formData, productId);
			if (!result.success) {
				set((state) => ({
					reviewsByProduct: {
						...state.reviewsByProduct,
						[productId]: reviews,
					},
				}));
				return { success: false };
			}
			return { success: true, review: optimistic };
		} catch {
			set((state) => ({
				reviewsByProduct: {
					...state.reviewsByProduct,
					[productId]: reviews,
				},
			}));
			return { success: false };
		}
	},
	handleRemoveAction: async (productId, userId) => {
		if (!userId) return { success: false };

		const reviews = get().reviewsByProduct[productId] || [];
		const remaining = reviews.filter((r) => r.user.id !== userId);

		set((state) => ({
			reviewsByProduct: { ...state.reviewsByProduct, [productId]: remaining },
		}));

		try {
			const result = await removeFeedback(productId);
			if (!result.success) {
				set((state) => ({
					reviewsByProduct: { ...state.reviewsByProduct, [productId]: reviews },
				}));
				return { success: false };
			}
			return { success: true };
		} catch {
			set((state) => ({
				reviewsByProduct: { ...state.reviewsByProduct, [productId]: reviews },
			}));
			return { success: false };
		}
	},
}));
