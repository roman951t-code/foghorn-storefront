import { VStack, Heading, Box, Button } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import ViewedProducts from '@/components/pages/cabinet/viewed/ViewedProducts';
import Pagination from '@/components/reusable/Pagination';

export default function Reviewed() {
	const t = useTranslations('Sidebar');
	const genT = useTranslations('General');

	return (
		<VStack mt='4' w='100%' pr='3'>
			<Heading as='h2' size='2xl' fontWeight='normal' w='100%'>
				{t('reviewedProducts')}
			</Heading>
			<Button
				colorPalette='gray'
				color='main'
				variant='outline'
				border='1px solid '
				borderColor='border'
				size='sm'
				w='140px'
				alignSelf='flex-end'
			>
				{genT('clear')}
			</Button>
			<Box as='section' w='100%'>
				<ViewedProducts />
			</Box>
			<Pagination />
		</VStack>
	);
}
