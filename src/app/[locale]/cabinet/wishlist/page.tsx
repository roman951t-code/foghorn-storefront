import { VStack, HStack, Heading, IconButton, Icon, Highlight, Text } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { IoShareSocialOutline } from 'react-icons/io5';
import WishList from '@/components/pages/cabinet/wishlist/WishList';
import ProductsFilter from '@/components/pages/cabinet/wishlist/ProductsFilter';
import { FiTrash2 } from 'react-icons/fi';

export default function Wishlist() {
	const t = useTranslations('Sidebar');

	return (
		<VStack mt='4' w='100%' pr='2'>
			<Heading as='h2' size='2xl' fontWeight='normal' w='100%'>
				{t('wishList')}
			</Heading>

			<HStack w='100%' mt='6' justifyContent='space-between' alignItems='flex-start'>
				<Text>
					<Highlight query='100 шт' styles={{ fontWeight: 'semibold' }}>
						{`Всього товарів: 100 шт`}
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
							color='colorPalette.500'
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
		</VStack>
	);
}
