import { VStack, Heading, Box } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import ViewedProducts from '../_components/viewed/ViewedProducts';
import Pagination from '@/components/ui/Pagination';
import { TertiaryButton } from '@/components/ui/buttons/ActionButton';

export default function Reviewed() {
	const navT = useTranslations('navigation');
	const genT = useTranslations('common');

	return (
		<VStack w='100%'>
				<Heading as='h2' size='2xl' fontWeight='normal' w='100%'>
					{navT('sidebar.reviewedProducts')}
				</Heading>
				<TertiaryButton
					w={{ base: 'full', sm: '140px' }}
					alignSelf='flex-end'
					mt={{ base: '8', sm: '0' }}
				>
					{genT('clear')}
				</TertiaryButton>

			<Box as='section' w='100%'>
				<ViewedProducts />
			</Box>
			<Pagination
				currentPage={1}
				totalProductsCount={0}
				productsPerPage={1}
				baseRoute='/cabinet/reviewed'
			/>
		</VStack>
	);
}
