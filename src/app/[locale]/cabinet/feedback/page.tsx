'use client';

import { VStack } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import Pagination from '@/components/ui/Pagination';
import { PRODUCTS_PER_PAGE, resolvePageParam, resolvePerPageParam } from '@/constants/pagination';
import UserFeedbackList from '../_components/feedback/UserFeedbackList';
import CabinetFeedbackSkeleton from '@/components/ui/skeletons/CabinetFeedbackSkeleton';
import { useCabinetCache } from '@/hooks/useCabinetCache';
import type { UserReviewedProduct } from '@/actions/feedback/getUserReviewedProducts';

type FeedbackResponse = { items: UserReviewedProduct[]; totalCount: number };

async function fetchFeedback(page: number, pageSize: number): Promise<FeedbackResponse> {
	const res = await fetch(`/api/cabinet/feedback?page=${page}&perPage=${pageSize}`, {
		cache: 'no-store',
	});
	if (!res.ok) return { items: [], totalCount: 0 };
	return res.json();
}

export default function Feedback() {
	const prodT = useTranslations('products');
	const validT = useTranslations('validation');
	const searchParams = useSearchParams();
	const page = resolvePageParam(searchParams.get('page') ?? undefined);
	const pageSize = resolvePerPageParam(searchParams.get('perPage') ?? `${PRODUCTS_PER_PAGE}`);

	const { data, loading } = useCabinetCache(`feedback:page=${page}&perPage=${pageSize}`, () =>
		fetchFeedback(page, pageSize),
	);

	if (loading && !data) return <CabinetFeedbackSkeleton />;

	const items = data?.items ?? [];
	const totalCount = data?.totalCount ?? 0;

	return (
		<VStack w='100%' mt='4'>
			<UserFeedbackList
				items={items}
				emptyText={prodT('feedbackAbsent')}
				deleteFailText={validT('deleteReviewFail')}
			/>

			{totalCount > 0 && (
				<Pagination
					currentPage={page}
					totalItems={totalCount}
					pageSize={pageSize}
					baseRoute='/cabinet/feedback'
				/>
			)}
		</VStack>
	);
}
