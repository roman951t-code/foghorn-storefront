import { VStack, Heading } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import OrderCard from '@/components/reusable/cards/OrderCard';
import Pagination from '@/components/reusable/Pagination';

export default function Orders() {
	const t = useTranslations('Sidebar');

	return (
		<VStack mt='4' w='100%' pr='3'>
			<Heading as='h2' size='2xl' fontWeight='normal' w='100%' mb='4'>
				{t('myOrders')}
			</Heading>
			<OrderCard />
			<Pagination />
		</VStack>
	);
}
