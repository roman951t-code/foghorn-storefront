import { Suspense } from 'react';
import { VStack } from '@chakra-ui/react';
import { getTranslations } from 'next-intl/server';
import Pagination from '@/components/ui/Pagination';
import { PRODUCTS_PER_PAGE, resolveOffset, resolvePageParam, resolvePerPageParam } from '@/constants/pagination';
import { getUserOrders } from '@/actions/getUserOrders';
import UserOrdersList from '../_components/orders/UserOrdersList';
import CabinetPageContentSkeleton from '@/components/ui/skeletons/CabinetPageContentSkeleton';

type Props = {
	searchParams?: Promise<{
		page?: string;
		perPage?: string;
		payment?: string;
		session_id?: string;
	}>;
};

export default function Orders({ searchParams }: Props) {
	return (
		<Suspense fallback={<CabinetPageContentSkeleton />}>
			<OrdersContent searchParams={searchParams} />
		</Suspense>
	);
}

async function OrdersContent({ searchParams }: Props) {
	const ordersT = await getTranslations('orders');

	const params = await searchParams;
	if (params?.payment === 'success' && params?.session_id) {
		// Finalize Stripe payment on redirect
		const { finalizeStripeOrder } = await import('@/actions/payments/finalizeStripeOrder');
		await finalizeStripeOrder(params.session_id);
	}

	const rawPage = resolvePageParam(params?.page ?? '1');
	const pageSize = resolvePerPageParam(params?.perPage ?? `${PRODUCTS_PER_PAGE}`);
	const offset = resolveOffset(rawPage, pageSize);

	const { items, totalCount } = await getUserOrders(pageSize, offset);
	const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
	const currentPage = Math.min(rawPage, totalPages);

	const normalizedOffset = resolveOffset(currentPage, pageSize);
	const normalizedItems =
		normalizedOffset === offset ? items : (await getUserOrders(pageSize, normalizedOffset)).items;

	return (
		<VStack w='100%' mt='4'>
			<UserOrdersList orders={normalizedItems} emptyText={ordersT('empty')} />
			{totalCount > 0 && (
				<Pagination
					currentPage={currentPage}
					totalItems={totalCount}
					pageSize={pageSize}
					baseRoute='/cabinet/orders'
				/>
			)}
		</VStack>
	);
}
