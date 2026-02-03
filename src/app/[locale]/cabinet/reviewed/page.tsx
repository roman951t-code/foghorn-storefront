import { VStack, Box } from '@chakra-ui/react';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import ViewedProducts from '../_components/viewed/ViewedProducts';
import Pagination from '@/components/ui/Pagination';
import { auth } from '@/lib/auth';
import { getRecentlyViewedProducts } from '@/actions/products/getRecentlyViewedProducts';
import ClearViewedButton from '../_components/viewed/ClearViewedButton';
import { PRODUCTS_PER_PAGE } from '@/constants/pagination';
import CabinetSectionHeading from '@/components/ui/CabinetSectionHeading';

const VIEWED_LIMIT = 32;

type Props = {
	searchParams?: Promise<{
		page?: string;
		perPage?: string;
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
	const hasViewedProducts = totalProductsCount > 0;
	const params = await searchParams;
	const pageParam = Number.parseInt(params?.page ?? '1', 10);
	const requestedPerPage = Number.parseInt(params?.perPage ?? `${PRODUCTS_PER_PAGE}`, 10);
	const pageSize =
		Number.isNaN(requestedPerPage) || requestedPerPage <= 0 ? PRODUCTS_PER_PAGE : requestedPerPage;
	const totalPages = Math.max(1, Math.ceil(totalProductsCount / pageSize));
	let currentPage = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
	currentPage = Math.min(currentPage, totalPages);
	const startIndex = (currentPage - 1) * pageSize;
	const paginatedProducts = viewedProducts.slice(startIndex, startIndex + pageSize);

	return (
		<VStack w='100%'>
			<CabinetSectionHeading title={navT('sidebar.reviewedProducts')} />
			{hasViewedProducts && (
				<ClearViewedButton
					text={genT('clear')}
					w={{ base: 'full', sm: '140px' }}
					alignSelf='flex-end'
					mt={{ base: '8', sm: '0' }}
				/>
			)}

			<Box as='section' w='100%'>
				<ViewedProducts products={paginatedProducts} emptyText={productsT('productsNotFound')} />
			</Box>
			{hasViewedProducts && (
				<Pagination
					currentPage={currentPage}
					totalItems={totalProductsCount}
					pageSize={pageSize}
					baseRoute='/cabinet/reviewed'
				/>
			)}
		</VStack>
	);
}
