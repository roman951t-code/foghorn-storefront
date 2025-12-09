import { VStack, HStack, IconButton, Icon } from '@chakra-ui/react';
import { IoShareSocialOutline } from 'react-icons/io5';
import WishList from '../_components/wishlist/WishList';
import ProductsFilter from '../_components/wishlist/ProductsFilter';
import { FiTrash2 } from 'react-icons/fi';
import WishlistPagination from '../_components/wishlist/WishlistPagination';
import CabinetSectionHeading from '@/components/ui/CabinetSectionHeading';
import WishListCount from '../_components/wishlist/WishlistCount';
import { PRODUCTS_PER_PAGE } from '@/constants/pagination';
import { getTranslations } from 'next-intl/server';

type Props = {
	searchParams?: Promise<{
		page?: string;
		perPage?: string;
	}>;
};

export default async function Wishlist({ searchParams }: Props) {
	const [navT, prodT, genT, wishT] = await Promise.all([
		getTranslations('navigation'),
		getTranslations('products'),
		getTranslations('common'),
		getTranslations('wishlist'),
	]);

	const params = await searchParams;
	const requestedPage = Number.parseInt(params?.page ?? '1', 10);
	const requestedPerPage = Number.parseInt(params?.perPage ?? `${PRODUCTS_PER_PAGE}`, 10);
	const pageSize =
		Number.isNaN(requestedPerPage) || requestedPerPage <= 0 ? PRODUCTS_PER_PAGE : requestedPerPage;
	const currentPage = Number.isNaN(requestedPage) || requestedPage < 1 ? 1 : requestedPage;

	const i18nData = {
		new: prodT('new'),
		expensiveToCheap: prodT('expensiveToCheap'),
		cheapToExpensive: prodT('cheapToExpensive'),
	};

	return (
		<VStack>
			<CabinetSectionHeading title={navT('sidebar.wishList')} />

			<HStack w='100%' mt='6' justifyContent='space-between' alignItems='flex-start'>
				<WishListCount totalProductsText={prodT('totalProducts')} unitsText={genT('units')} />

				<VStack mt='-4'>
					<HStack alignSelf='flex-end' gap='2'>
						<IconButton
							size='md'
							aria-label='Share wishlist'
							variant='ghost'
							rounded='full'
							colorPalette='orange'
							color='colorPalette.500'
							transition='all 0.2s ease-in-out'
							_hover={{
								bg: 'colorPalette.500',
								color: 'main.lightOnly',
							}}
						>
							<Icon size='lg'>
								<IoShareSocialOutline />
							</Icon>
						</IconButton>
						<IconButton
							size='md'
							aria-label='Clear wishlist'
							variant='ghost'
							rounded='full'
							colorPalette='gray'
							color='main.disabled'
							transition='all 0.2s ease-in-out'
							_hover={{
								bg: 'colorPalette.500',
								color: 'main.lightOnly',
							}}
						>
							<Icon size='md'>
								<FiTrash2 />
							</Icon>
						</IconButton>
					</HStack>
					<ProductsFilter i18nData={i18nData} />
				</VStack>
			</HStack>
			<WishList emptyText={wishT('wishListEmpty')} currentPage={currentPage} pageSize={pageSize} />
			<WishlistPagination currentPage={currentPage} pageSize={pageSize} />
		</VStack>
	);
}
