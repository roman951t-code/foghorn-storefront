import { VStack, Heading, Box } from '@chakra-ui/react';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import ViewedProducts from '../_components/viewed/ViewedProducts';
import Pagination from '@/components/ui/Pagination';
import { auth } from '@/lib/auth';
import { getRecentlyViewedProducts } from '@/actions/products/getRecentlyViewedProducts';
import ClearViewedButton from '../_components/viewed/ClearViewedButton';
import { PRODUCTS_PER_PAGE } from '@/constants/pagination';

const VIEWED_LIMIT = 32;

type Props = {
	searchParams?: Promise<{
		page?: string;
	}>;
};

export default async function Reviewed({ searchParams }: Props) {
	const [navT, genT, productsT] = await Promise.all([
		getTranslations('navigation'),
		getTranslations('common'),
		getTranslations('products'),
	]);

	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id;
	const viewedProducts = userId ? await getRecentlyViewedProducts(userId, VIEWED_LIMIT) : [];

	const totalProductsCount = viewedProducts.length;
	const totalPages = Math.max(1, Math.ceil(totalProductsCount / PRODUCTS_PER_PAGE));
	const params = await searchParams;
	const pageParam = Number.parseInt(params?.page ?? '1', 10);
	let currentPage = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
	currentPage = Math.min(currentPage, totalPages);
	const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
	const paginatedProducts = viewedProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

	return (
		<VStack w='100%'>
			<Heading as='h2' size='2xl' fontWeight='normal' w='100%'>
				{navT('sidebar.reviewedProducts')}
			</Heading>
	<ClearViewedButton
		text={genT('clear')}
		w={{ base: 'full', sm: '140px' }}
		alignSelf='flex-end'
		mt={{ base: '8', sm: '0' }}
		isDisabled={!totalProductsCount}
	/>

			<Box as='section' w='100%'>
				<ViewedProducts products={paginatedProducts} emptyText={productsT('productsNotFound')} />
			</Box>
			<Pagination
				currentPage={currentPage}
				totalProductsCount={totalProductsCount}
				productsPerPage={PRODUCTS_PER_PAGE}
				baseRoute='/cabinet/reviewed'
			/>
		</VStack>
	);
}
