import { VStack, Heading, Box } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import ViewedProducts from '@/components/pages/cabinet/viewed/ViewedProducts';
import Pagination from '@/components/reusable/Pagination';
import { TertiaryButton } from '@/components/reusable/buttons/ActionButton';

export default function Reviewed() {
	const t = useTranslations('Sidebar');
	const genT = useTranslations('General');

	return (
		<VStack w='100%'>
			<Heading as='h2' size='2xl' fontWeight='normal' w='100%'>
				{t('reviewedProducts')}
			</Heading>
			<TertiaryButton
				w={{ base: 'full', xs: '140px' }}
				alignSelf='flex-end'
				mt={{ base: '8', xs: '0' }}
			>
				{genT('clear')}
			</TertiaryButton>

			<Box as='section' w='100%'>
				<ViewedProducts />
			</Box>
			<Pagination />
		</VStack>
	);
}
