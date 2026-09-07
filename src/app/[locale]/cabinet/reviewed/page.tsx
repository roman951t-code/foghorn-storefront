'use client';

import { useState } from 'react';
import { VStack, Box } from '@chakra-ui/react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import ViewedProducts from '../_components/viewed/ViewedProducts';
import Pagination from '@/components/ui/Pagination';
import ClearViewedButton from '../_components/viewed/ClearViewedButton';
import {
	PRODUCTS_PER_PAGE,
	resolvePageParam,
	resolvePerPageParam,
} from '@/constants/pagination';
import CabinetProductGridSkeleton from '@/components/ui/skeletons/CabinetProductGridSkeleton';
import { useCabinetCache, invalidateCabinetCache } from '@/hooks/useCabinetCache';
import type { SubcategoryProduct } from '@/types/product';

type ReviewedResponse = { items: SubcategoryProduct[]; totalCount: number };

async function fetchReviewed(page: number, pageSize: number, locale: string): Promise<ReviewedResponse> {
	const res = await fetch(
		`/api/cabinet/reviewed?page=${page}&perPage=${pageSize}&locale=${locale}`,
		{ cache: 'no-store' },
	);
	if (!res.ok) return { items: [], totalCount: 0 };
	return res.json();
}

export default function Reviewed() {
	const genT = useTranslations('common');
	const productsT = useTranslations('products');
	const locale = useLocale();
	const searchParams = useSearchParams();
	const page = resolvePageParam(searchParams.get('page') ?? undefined);
	const pageSize = resolvePerPageParam(searchParams.get('perPage') ?? `${PRODUCTS_PER_PAGE}`);
	const [refreshTick, setRefreshTick] = useState(0);

	const cacheKey = `reviewed:page=${page}&perPage=${pageSize}&locale=${locale}&t=${refreshTick}`;
	const { data, loading } = useCabinetCache(cacheKey, () => fetchReviewed(page, pageSize, locale));

	if (loading && !data) return <CabinetProductGridSkeleton />;

	const items = data?.items ?? [];
	const totalCount = data?.totalCount ?? 0;
	const hasViewedProducts = totalCount > 0;

	return (
		<VStack w='100%' mt='4'>
			{hasViewedProducts && (
				<ClearViewedButton
					text={genT('clear')}
					w='160px'
					alignSelf={{ base: 'center', sm: 'flex-end' }}
					mt={{ base: '4', sm: '0' }}
					onCleared={() => {
						invalidateCabinetCache('reviewed:');
						setRefreshTick((t) => t + 1);
					}}
				/>
			)}

			<Box as='section' w='100%'>
				<ViewedProducts products={items} emptyText={productsT('productsNotFound')} />
			</Box>
			{hasViewedProducts && (
				<Pagination
					currentPage={page}
					totalItems={totalCount}
					pageSize={pageSize}
					baseRoute='/cabinet/reviewed'
				/>
			)}
		</VStack>
	);
}
