'use client';
import { Grid, Box, VStack, EmptyState } from '@chakra-ui/react';
import { HiColorSwatch } from 'react-icons/hi';
import ProductCard from '@/features/product/cards/ProductCard';
import { SubcategoryProduct } from '@/types/product';
import { PRODUCTS_GRID_CSS } from '@/constants/grids';

interface Props {
	products: SubcategoryProduct[];
	notFound: string;
	limit?: number;
}

export default function ProductsGrid({ products, notFound, limit }: Props) {
	if (!products || products.length === 0) {
		return (
			<EmptyState.Root>
				<EmptyState.Content>
					<EmptyState.Indicator>
						<HiColorSwatch />
					</EmptyState.Indicator>
					<VStack textAlign='center'>
						<EmptyState.Title>{notFound}</EmptyState.Title>
					</VStack>
				</EmptyState.Content>
			</EmptyState.Root>
		);
	}

	const visibleProducts = limit ? products.slice(0, limit) : products;

	return (
		<Grid
			className='productsSlider'
			columnGap={2}
			rowGap={4}
			px={{ base: 1, sm: 0 }}
			css={PRODUCTS_GRID_CSS}
		>
			{visibleProducts.map((product) => (
				<Box key={product.id}>
					<ProductCard product={product} />
				</Box>
			))}
		</Grid>
	);
}
