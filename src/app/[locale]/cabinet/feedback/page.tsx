import { VStack, Heading } from '@chakra-ui/react';
import { getTranslations } from 'next-intl/server';
import Pagination from '@/components/ui/Pagination';
import { PRODUCTS_PER_PAGE } from '@/constants/pagination';
import { getUserReviewedProducts } from '@/actions/feedback/getUserReviewedProducts';
import UserFeedbackList from '../_components/feedback/UserFeedbackList';

type Props = {
	searchParams?: Promise<{
		page?: string;
	}>;
};

export default async function Feedback({ searchParams }: Props) {
	const [navT, prodT, validT] = await Promise.all([
		getTranslations('navigation'),
		getTranslations('products'),
		getTranslations('validation'),
	]);

	const params = await searchParams;
	const requestedPage = Number.parseInt(params?.page ?? '1', 10);
	const rawPage = Number.isNaN(requestedPage) || requestedPage < 1 ? 1 : requestedPage;
	const offset = (rawPage - 1) * PRODUCTS_PER_PAGE;

	const { items, totalCount } = await getUserReviewedProducts(PRODUCTS_PER_PAGE, offset);
	const totalPages = Math.max(1, Math.ceil(totalCount / PRODUCTS_PER_PAGE));
	const currentPage = Math.min(rawPage, totalPages);

	const normalizedOffset = (currentPage - 1) * PRODUCTS_PER_PAGE;
	const normalizedItems =
		normalizedOffset === offset
			? items
			: (await getUserReviewedProducts(PRODUCTS_PER_PAGE, normalizedOffset)).items;

	return (
		<VStack w='100%'>
			<Heading as='h2' size='2xl' fontWeight='normal' w='100%' mb='4'>
				{navT('sidebar.myFeedback')}
			</Heading>

			<UserFeedbackList
				items={normalizedItems}
				emptyText={prodT('feedbackAbsent')}
				deleteFailText={validT('deleteReviewFail')}
			/>

			<Pagination
				currentPage={currentPage}
				totalProductsCount={totalCount}
				productsPerPage={PRODUCTS_PER_PAGE}
				baseRoute='/cabinet/feedback'
			/>
		</VStack>
	);
}
