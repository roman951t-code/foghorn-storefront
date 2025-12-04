import { VStack, HStack, Heading, IconButton, Icon } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { IoShareSocialOutline } from 'react-icons/io5';
import WishList from '../_components/wishlist/WishList';
import ProductsFilter from '../_components/wishlist/ProductsFilter';
import { FiTrash2 } from 'react-icons/fi';
import WishlistPagination from '../_components/wishlist/WishlistPagination';
import WishListCount from '../_components/wishlist/WishlistCount';

export default function Wishlist() {
	const navT = useTranslations('navigation');
	const prodT = useTranslations('products');
	const genT = useTranslations('common');
	const wishT = useTranslations('wishlist');

	const i18nData = {
		new: prodT('new'),
		expensiveToCheap: prodT('expensiveToCheap'),
		cheapToExpensive: prodT('cheapToExpensive'),
	};

	return (
		<VStack>
			<Heading as='h2' size='2xl' fontWeight='normal' w='100%'>
				{navT('sidebar.wishList')}
			</Heading>

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
			<WishList emptyText={wishT('wishListEmpty')} />
			<WishlistPagination />
		</VStack>
	);
}
