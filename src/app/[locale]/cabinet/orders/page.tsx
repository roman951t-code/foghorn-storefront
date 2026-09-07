'use client';

import { useEffect, useRef, useState } from 'react';
import { VStack } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import Pagination from '@/components/ui/Pagination';
import { PRODUCTS_PER_PAGE, resolvePageParam, resolvePerPageParam } from '@/constants/pagination';
import UserOrdersList from '../_components/orders/UserOrdersList';
import CabinetOrdersSkeleton from '@/components/ui/skeletons/CabinetOrdersSkeleton';
import { useCabinetCache, invalidateCabinetCache } from '@/hooks/useCabinetCache';
import type { UserOrder } from '@/types/order';

type OrdersResponse = { items: UserOrder[]; totalCount: number };

async function fetchOrders(page: number, pageSize: number): Promise<OrdersResponse> {
	const res = await fetch(`/api/cabinet/orders?page=${page}&perPage=${pageSize}`, {
		cache: 'no-store',
	});
	if (!res.ok) return { items: [], totalCount: 0 };
	return res.json();
}

export default function Orders() {
	const ordersT = useTranslations('orders');
	const searchParams = useSearchParams();
	const page = resolvePageParam(searchParams.get('page') ?? undefined);
	const pageSize = resolvePerPageParam(searchParams.get('perPage') ?? `${PRODUCTS_PER_PAGE}`);

	// Landing here from the Stripe redirect (?payment=success&session_id=...)
	// used to finalize the order server-side before the page ever rendered.
	// Now that data comes from the client cache, finalize once on mount and
	// force a fresh fetch afterward — otherwise the newly-created order
	// wouldn't show up until a hard reload dropped the cache.
	const paymentSuccess = searchParams.get('payment') === 'success';
	const sessionId = searchParams.get('session_id');
	const finalizedRef = useRef<string | null>(null);
	const [refreshTick, setRefreshTick] = useState(() =>
		paymentSuccess && sessionId ? Date.now() : 0,
	);

	useEffect(() => {
		if (!paymentSuccess || !sessionId || finalizedRef.current === sessionId) return;
		finalizedRef.current = sessionId;
		import('@/actions/payments/finalizeStripeOrder').then(({ finalizeStripeOrder }) =>
			finalizeStripeOrder(sessionId).finally(() => {
				invalidateCabinetCache('orders:');
				setRefreshTick((t) => t + 1);
			}),
		);
	}, [paymentSuccess, sessionId]);

	const cacheKey = `orders:page=${page}&perPage=${pageSize}&t=${refreshTick}`;
	const { data, loading } = useCabinetCache(cacheKey, () => fetchOrders(page, pageSize));

	// Cancelling/deleting an order mutates the DB directly (a server action),
	// not a fetch this page's own cache knows about, and router.refresh() is a
	// no-op here since this whole route is client-rendered — same class of
	// problem the Stripe-finalize effect above already solves the same way.
	const handleOrderMutated = () => {
		invalidateCabinetCache('orders:');
		setRefreshTick((t) => t + 1);
	};

	if (loading && !data) return <CabinetOrdersSkeleton />;

	const items = data?.items ?? [];
	const totalCount = data?.totalCount ?? 0;

	return (
		<VStack w='100%' mt='4'>
			<UserOrdersList
				orders={items}
				emptyText={ordersT('empty')}
				onOrderMutated={handleOrderMutated}
			/>
			{totalCount > 0 && (
				<Pagination
					currentPage={page}
					totalItems={totalCount}
					pageSize={pageSize}
					baseRoute='/cabinet/orders'
				/>
			)}
		</VStack>
	);
}
