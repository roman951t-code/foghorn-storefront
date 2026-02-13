import { VStack } from '@chakra-ui/react';
import { getTranslations } from 'next-intl/server';
import Pagination from '@/components/ui/Pagination';
import { PRODUCTS_PER_PAGE, resolveOffset, resolvePageParam, resolvePerPageParam } from '@/constants/pagination';
import { getUserReviewedProducts } from '@/actions/feedback/getUserReviewedProducts';
import UserFeedbackList from '../_components/feedback/UserFeedbackList';
import CabinetSectionHeading from '../../../../components/ui/CabinetSectionHeading';

type Props = {
	searchParams?: Promise<{
		page?: string;
		perPage?: string;
	}>;
};

export default async function Feedback({ searchParams }: Props) {
	const [navT, prodT, validT] = await Promise.all([
		getTranslations('navigation'),
		getTranslations('products'),
		getTranslations('validation'),
	]);

	const params = await searchParams;
	const rawPage = resolvePageParam(params?.page ?? '1');
	const pageSize = resolvePerPageParam(params?.perPage ?? `${PRODUCTS_PER_PAGE}`);
	const offset = resolveOffset(rawPage, pageSize);

	const { items, totalCount } = await getUserReviewedProducts(pageSize, offset);
	const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
	const currentPage = Math.min(rawPage, totalPages);

	const normalizedOffset = resolveOffset(currentPage, pageSize);
	const normalizedItems =
		normalizedOffset === offset
			? items
			: (await getUserReviewedProducts(pageSize, normalizedOffset)).items;

	return (
		<VStack w='100%'>
			<CabinetSectionHeading title={navT('sidebar.myFeedback')} mb='8' />

			<UserFeedbackList
				items={normalizedItems}
				emptyText={prodT('feedbackAbsent')}
				deleteFailText={validT('deleteReviewFail')}
			/>

			{totalCount > 0 && (
				<Pagination
					currentPage={currentPage}
					totalItems={totalCount}
					pageSize={pageSize}
					baseRoute='/cabinet/feedback'
				/>
			)}
		</VStack>
	);
}
