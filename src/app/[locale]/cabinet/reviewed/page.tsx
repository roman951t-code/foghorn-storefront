import { VStack, Box } from '@chakra-ui/react';
import { getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import ViewedProducts from '../_components/viewed/ViewedProducts';
import Pagination from '@/components/ui/Pagination';
import { auth } from '@/lib/auth';
import { getRecentlyViewedProducts } from '@/actions/products/getRecentlyViewedProducts';
import ClearViewedButton from '../_components/viewed/ClearViewedButton';
import { PRODUCTS_PER_PAGE, resolveOffset, resolvePageParam, resolvePerPageParam } from '@/constants/pagination';
import CabinetSectionHeading from '@/components/ui/CabinetSectionHeading';
import { LocaleParams } from '@/types/routing';

const VIEWED_LIMIT = 32;

type Props = LocaleParams & {
	searchParams?: Promise<{
		page?: string;
		perPage?: string;
	}>;
};

export default async function Reviewed({ params, searchParams }: Props) {
	const { locale } = await params;
	const [navT, genT, productsT] = await Promise.all([
		getTranslations('navigation'),
		getTranslations('common'),
		getTranslations('products'),
	]);

	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id;
	const viewedProducts = userId
		? await getRecentlyViewedProducts(userId, VIEWED_LIMIT, 0, locale)
		: [];

	const totalProductsCount = viewedProducts.length;
	const hasViewedProducts = totalProductsCount > 0;
	const search = await searchParams;
	const pageParam = resolvePageParam(search?.page ?? '1');
	const pageSize = resolvePerPageParam(search?.perPage ?? `${PRODUCTS_PER_PAGE}`);
	const totalPages = Math.max(1, Math.ceil(totalProductsCount / pageSize));
	let currentPage = pageParam;
	currentPage = Math.min(currentPage, totalPages);
	const startIndex = resolveOffset(currentPage, pageSize);
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
