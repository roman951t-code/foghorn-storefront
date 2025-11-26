'use client';
import { SimpleGrid, Box, EmptyState } from '@chakra-ui/react';
import ProductCard from '@/components/reusable/cards/ProductCard';
import { useWishList } from '@/components/providers/useWishList';
import { HiColorSwatch } from 'react-icons/hi';

export default function WishList({ emptyText }: { emptyText: string }) {
	const { items } = useWishList();

	return items?.length ? (
		<SimpleGrid
			my='4'
			className='productsSlider'
			columns={{ base: 1, prodXs: 2, prodSm: 3, prodMd: 4, prodLg: 5, prodXl: 6 } as any}
			gapX='2'
			gapY='4'
		>
			{items?.map((product, index) => (
				<Box key={index}>
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
