import { VStack } from '@chakra-ui/react';
import { getTranslations } from 'next-intl/server';
import Pagination from '@/components/ui/Pagination';
import { PRODUCTS_PER_PAGE } from '@/constants/pagination';
import { getUserOrders } from '@/actions/getUserOrders';
import UserOrdersList from '../_components/UserOrdersList';
import CabinetSectionHeading from '../_components/CabinetSectionHeading';

type Props = {
	searchParams?: Promise<{
		page?: string;
	}>;
};

export default async function Orders({ searchParams }: Props) {
	const [navT, ordersT] = await Promise.all([
		getTranslations('navigation'),
		getTranslations('orders'),
	]);

	const params = await searchParams;
	const requestedPage = Number.parseInt(params?.page ?? '1', 10);
	const rawPage = Number.isNaN(requestedPage) || requestedPage < 1 ? 1 : requestedPage;
	const offset = (rawPage - 1) * PRODUCTS_PER_PAGE;

	const { items, totalCount } = await getUserOrders(PRODUCTS_PER_PAGE, offset);
	const totalPages = Math.max(1, Math.ceil(totalCount / PRODUCTS_PER_PAGE));
	const currentPage = Math.min(rawPage, totalPages);

	const normalizedOffset = (currentPage - 1) * PRODUCTS_PER_PAGE;
	const normalizedItems =
		normalizedOffset === offset
			? items
			: (await getUserOrders(PRODUCTS_PER_PAGE, normalizedOffset)).items;

	return (
		<VStack w='100%'>
			<CabinetSectionHeading title={navT('sidebar.myOrders')} mb='8' />
			<UserOrdersList orders={normalizedItems} emptyText={ordersT('empty')} />
			<Pagination
				currentPage={currentPage}
				totalProductsCount={totalCount}
				productsPerPage={PRODUCTS_PER_PAGE}
				baseRoute='/cabinet/orders'
			/>
		</VStack>
	);
}
