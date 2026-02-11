'use client';

import { Accordion, EmptyState } from '@chakra-ui/react';
import { VscFeedback } from 'react-icons/vsc';
import { useEffect, useState } from 'react';
import { removeFeedback } from '@/actions/feedback/removeFeedback';
import { showToaster } from '@/utils/toast';
import { toasterMessages } from '@/data/toasterMessages';
import type { UserReviewedProduct } from '@/actions/feedback/getUserReviewedProducts';
import type { Review } from '@/types/product';
import { ReviewCard } from './ReviewCard';
import { EmptyReviewCard } from './EmptyReviewCard';

type Props = {
	items: UserReviewedProduct[];
	emptyText: string;
	deleteFailText: string;
};

type FeedbackItem = Omit<UserReviewedProduct, 'review'> & {
	review: Review | null;
	hasRemoved?: boolean;
};

function formatPrice(basePrice?: number, discountPrice?: number | null) {
	const base = basePrice ?? 0;
	const discount = discountPrice ?? null;
	if (discount && discount > 0) {
		return {
			current: discount,
			previous: base,
			savings: base - discount,
		};
	}
	return { current: base, previous: null, savings: null };
}

export default function UserFeedbackList({ items, emptyText, deleteFailText }: Props) {
	const [data, setData] = useState<FeedbackItem[]>(
		items.map((item) => ({ ...item, review: item.review ?? null }))
	);
	const [pendingId, setPendingId] = useState<string | null>(null);

	useEffect(() => {
		setData(items.map((item) => ({ ...item, review: item.review ?? null })));
	}, [items]);

	const handleRemove = async (productId: string) => {
		const snapshot = data.map((item) => ({ ...item }));
		setPendingId(productId);
		setData((prev) =>
			prev.map((item) =>
				item.product.id === productId ? { ...item, review: null, hasRemoved: true } : item
			)
		);

		try {
			const res = await removeFeedback(productId);
			if (!res.success) {
				setData(snapshot);
				showToaster('error', toasterMessages.reviewDeleteFailed(deleteFailText));
			}
		} catch {
			setData(snapshot);
			showToaster('error', toasterMessages.reviewDeleteFailed(deleteFailText));
		} finally {
			setPendingId(null);
		}
	};

	const handleReviewSuccess = (productId: string, review: Review) => {
		setData((prev) =>
			prev.map((item) =>
				item.product.id === productId ? { ...item, review, hasRemoved: false } : item
			)
		);
	};

	if (!data.length) {
		return (
			<EmptyState.Root>
				<EmptyState.Content>
					<EmptyState.Indicator>
						<VscFeedback />
					</EmptyState.Indicator>
					<EmptyState.Title>{emptyText}</EmptyState.Title>
				</EmptyState.Content>
			</EmptyState.Root>
		);
	}

	return (
		<Accordion.Root collapsible multiple>
			{data.map(({ product, review }) => {
				const price = formatPrice(product.basePrice, product.discountPrice);

				return review ? (
					<ReviewCard
						key={product.id}
						product={product}
						review={review}
						price={price}
						pending={pendingId === product.id}
						onRemoveAction={() => handleRemove(product.id)}
					/>
				) : (
					<EmptyReviewCard
						key={product.id}
						product={product}
						price={price}
						onAddAction={(newReview) => handleReviewSuccess(product.id, newReview)}
					/>
				);
			})}
		</Accordion.Root>
	);
}
