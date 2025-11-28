'use client';
import { SimpleGrid, Box, EmptyState } from '@chakra-ui/react';
import ProductCard from '@/components/product/cards/ProductCard';
import { useWishList } from '@/components/providers/useWishList';
import { HiColorSwatch } from 'react-icons/hi';

export default function WishList({ emptyText }: { emptyText: string }) {
	const { items } = useWishList();

	return items?.length ? (
		<SimpleGrid
			my='4'
			className='productsSlider'
			columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5, '2xl': 6 }}
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
