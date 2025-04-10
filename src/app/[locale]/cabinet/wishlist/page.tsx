import { VStack, HStack, Heading, IconButton, Icon, Highlight, Text } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { IoShareSocialOutline } from 'react-icons/io5';
import WishList from '@/components/pages/cabinet/wishlist/WishList';
import ProductsFilter from '@/components/pages/cabinet/wishlist/ProductsFilter';
import { FiTrash2 } from 'react-icons/fi';
import Pagination from '@/components/reusable/Pagination';

export default function Wishlist() {
	const t = useTranslations('Sidebar');
	const prodT = useTranslations('Products');
	const genT = useTranslations('General');

	return (
		<VStack>
			<Heading as='h2' size='2xl' fontWeight='normal' w='100%'>
				{t('wishList')}
			</Heading>

			<HStack w='100%' mt='6' justifyContent='space-between' alignItems='flex-start'>
				<Text>
					<Highlight query='100 шт' styles={{ fontWeight: 'semibold' }}>
						{`${prodT('totalProducts')}: 100 ${genT('units')}`}
					</Highlight>
				</Text>
				<VStack mt='-4'>
					<HStack alignSelf='flex-end' gap='2'>
						<IconButton
							size='md'
							aria-label='Cart'
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
							aria-label='Cart'
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
					<ProductsFilter />
				</VStack>
			</HStack>
			<WishList />
			<Pagination />
		</VStack>
	);
}
