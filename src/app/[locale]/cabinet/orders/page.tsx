import { VStack, Heading } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import OrderCard from '@/components/reusable/cards/OrderCard';
import Pagination from '@/components/reusable/Pagination';

export default function Orders() {
	const t = useTranslations('navigation');

	return (
		<VStack w='100%'>
			<Heading as='h2' size='2xl' fontWeight='normal' w='100%' mb='4'>
				{t('sidebar.myOrders')}
			</Heading>
			<OrderCard />
			{/* <Pagination /> */}
		</VStack>
	);
}
