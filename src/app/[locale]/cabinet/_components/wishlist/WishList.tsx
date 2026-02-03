'use client';
import { useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SimpleGrid, Box, EmptyState, VStack } from '@chakra-ui/react';
import ProductCard from '@/features/product/cards/ProductCard';
import { useWishList } from '@/hooks/useWishList';
import { LoadingSkeleton } from '@/components/ui/Skeleton';
import { FiHeart } from 'react-icons/fi';
import WishlistActions from './WishlistActions';
import WishListCount from './WishlistCount';
import { CABINET_PRODUCTS_GRID_CSS } from '@/constants/grids';

type Props = {
	emptyText: string;
	currentPage: number;
	pageSize: number;
	actionsSlot?: React.ReactNode;
	totalProductsText?: string;
	unitsText?: string;
	shareCopiedText?: string;
	sortI18n?: {
		new: string;
		expensiveToCheap: string;
		cheapToExpensive: string;
	};
};

export default function WishList({
	emptyText,
	currentPage,
	pageSize,
	actionsSlot,
	totalProductsText,
	unitsText,
	shareCopiedText,
	sortI18n,
}: Props) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { items, isHydrated } = useWishList();

	const safePageSize = Math.max(1, Math.floor(pageSize || 1));
	const totalItems = items?.length ?? 0;
	const totalPages = Math.max(1, Math.ceil(Math.max(totalItems, 0) / safePageSize));
	const safePage = Math.min(Math.max(1, currentPage), totalPages);

	useEffect(() => {
		if (!totalItems) return;
		if (safePage === currentPage) return;

		const searchParams = new URLSearchParams(window.location.search);
		searchParams.set('page', safePage.toString());
		searchParams.set('perPage', safePageSize.toString());
		router.replace(`${window.location.pathname}?${searchParams.toString()}`);
	}, [currentPage, router, safePage, safePageSize, totalItems]);

	const sortedItems = useMemo(() => {
		const orderBy = searchParams.get('orderBy');
		const toPrice = (product: any) => Number(product.discountPrice ?? product.basePrice ?? 0);
		if (orderBy === 'expensive') {
			return [...items].sort((a, b) => toPrice(b) - toPrice(a));
		}
		if (orderBy === 'cheap') {
			return [...items].sort((a, b) => toPrice(a) - toPrice(b));
		}
		return items;
	}, [items, searchParams]);

	const visibleItems = useMemo(() => {
		const start = (safePage - 1) * safePageSize;
		return sortedItems.slice(start, start + safePageSize);
	}, [sortedItems, safePage, safePageSize]);

	if (!isHydrated) {
		return (
			<SimpleGrid
				mt='8'
				mb='4'
				className='productsSlider'
				columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
				gapX='2'
				gapY='4'
				w='100%'
			>
				{Array.from({ length: safePageSize }).map((_, index) => (
					<Box key={`wishlist-skeleton-${index}`}>
						<LoadingSkeleton />
					</Box>
				))}
			</SimpleGrid>
		);
	}

	if (!totalItems) {
		return (
			<EmptyState.Root>
				<EmptyState.Content>
					<EmptyState.Indicator>
						<FiHeart />
					</EmptyState.Indicator>
					<EmptyState.Title>{emptyText}</EmptyState.Title>
				</EmptyState.Content>
			</EmptyState.Root>
		);
	}

	return (
		<VStack w='100%' alignItems='stretch'>
			{actionsSlot}
			{totalProductsText && unitsText && shareCopiedText && sortI18n && (
				<WishlistActions
					i18nData={{
						new: sortI18n.new,
						expensiveToCheap: sortI18n.expensiveToCheap,
						cheapToExpensive: sortI18n.cheapToExpensive,
					}}
					shareCopiedText={shareCopiedText}
					countSlot={<WishListCount totalProductsText={totalProductsText} unitsText={unitsText} />}
				/>
			)}
			<SimpleGrid
				mt='8'
				mb='4'
				className='productsSlider'
				css={CABINET_PRODUCTS_GRID_CSS}
				gapX='2'
				gapY='4'
				w='100%'
			>
				{visibleItems.map((product) => (
					<Box key={product.id}>
						<ProductCard product={product} />
					</Box>
				))}
			</SimpleGrid>
		</VStack>
	);
}
