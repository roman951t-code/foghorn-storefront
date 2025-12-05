import { SimpleGrid, Box, EmptyState } from '@chakra-ui/react';
import { HiOutlineEye } from 'react-icons/hi';
import ProductCard, { type CardProduct } from '@/features/product/cards/ProductCard';

type Props = {
	products: CardProduct[];
	emptyText: string;
};

export default function ViewedProducts({ products, emptyText }: Props) {
	if (!products.length) {
		return (
			<EmptyState.Root>
				<EmptyState.Content>
					<EmptyState.Indicator>
						<HiOutlineEye />
					</EmptyState.Indicator>
					<EmptyState.Title>{emptyText}</EmptyState.Title>
				</EmptyState.Content>
			</EmptyState.Root>
		);
	}

	return (
		<SimpleGrid
			my='4'
			className='productsSlider'
			columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5, '2xl': 6 }}
			gapX='2'
			gapY='4'
		>
			{products.map((product) => (
				<Box key={product.id}>
					<ProductCard product={product} />
				</Box>
			))}
		</SimpleGrid>
	);
}
