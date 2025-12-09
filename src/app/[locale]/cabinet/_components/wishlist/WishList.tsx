'use client';
import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { SimpleGrid, Box, EmptyState } from '@chakra-ui/react';
import ProductCard from '@/features/product/cards/ProductCard';
import { useWishList } from '@/hooks/useWishList';
import { HiColorSwatch } from 'react-icons/hi';

type Props = {
	emptyText: string;
	currentPage: number;
	pageSize: number;
};

export default function WishList({ emptyText, currentPage, pageSize }: Props) {
	const router = useRouter();
	const { items } = useWishList();

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

	const visibleItems = useMemo(() => {
		const start = (safePage - 1) * safePageSize;
		return items.slice(start, start + safePageSize);
	}, [items, safePage, safePageSize]);

	return totalItems ? (
		<SimpleGrid
			my='4'
			className='productsSlider'
			columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5, '2xl': 6 }}
			gapX='2'
			gapY='4'
		>
			{visibleItems.map((product) => (
				<Box key={product.id}>
					<ProductCard product={product} />
				</Box>
			))}
		</SimpleGrid>
	) : (
		<EmptyState.Root>
			<EmptyState.Content>
				<EmptyState.Indicator>
					<HiColorSwatch />
				</EmptyState.Indicator>
				<EmptyState.Title>{emptyText}</EmptyState.Title>
			</EmptyState.Content>
		</EmptyState.Root>
	);
}
