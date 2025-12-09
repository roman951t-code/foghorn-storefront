import { VStack } from '@chakra-ui/react';
import { getTranslations } from 'next-intl/server';
import Pagination from '@/components/ui/Pagination';
import { PRODUCTS_PER_PAGE } from '@/constants/pagination';
import { getUserOrders } from '@/actions/getUserOrders';
import UserOrdersList from '../_components/orders/UserOrdersList';
import CabinetSectionHeading from '../../../../components/ui/CabinetSectionHeading';

type Props = {
	searchParams?: Promise<{
		page?: string;
		perPage?: string;
	}>;
};

export default async function Orders({ searchParams }: Props) {
	const [navT, ordersT] = await Promise.all([
		getTranslations('navigation'),
		getTranslations('orders'),
	]);

	const params = await searchParams;
	const requestedPage = Number.parseInt(params?.page ?? '1', 10);
	const requestedPerPage = Number.parseInt(params?.perPage ?? `${PRODUCTS_PER_PAGE}`, 10);
	const pageSize = Number.isNaN(requestedPerPage) || requestedPerPage <= 0 ? PRODUCTS_PER_PAGE : requestedPerPage;
	const rawPage = Number.isNaN(requestedPage) || requestedPage < 1 ? 1 : requestedPage;
	const offset = (rawPage - 1) * pageSize;

	const { items, totalCount } = await getUserOrders(pageSize, offset);
	const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
	const currentPage = Math.min(rawPage, totalPages);

	const normalizedOffset = (currentPage - 1) * pageSize;
	const normalizedItems =
		normalizedOffset === offset
			? items
			: (await getUserOrders(pageSize, normalizedOffset)).items;

	return (
		<VStack w='100%'>
			<CabinetSectionHeading title={navT('sidebar.myOrders')} mb='8' />
			<UserOrdersList orders={normalizedItems} emptyText={ordersT('empty')} />
			<Pagination
				currentPage={currentPage}
				totalItems={totalCount}
				pageSize={pageSize}
				baseRoute='/cabinet/orders'
			/>
		</VStack>
	);
}
