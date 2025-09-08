'use client';

import { SimpleGrid, Box, VStack } from '@chakra-ui/react';
import { EmptyState } from '@chakra-ui/react';
import { HiColorSwatch } from 'react-icons/hi';
import ProductCard from '../../reusable/cards/ProductCard';
import { SubcategoryProduct } from '@/types/product';

interface Props {
	products: SubcategoryProduct[];
	notFound: string;
}

export default function ProductsGrid({ products, notFound }: Props) {
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

	const columns = {
		base: 1,
		gridXs: 2,
		gridSm: 3,
		gridMd: 4,
		gridLg: 3,
		gridXl: 4,
		grid2Xl: 5,
	} as any;

	return (
		<SimpleGrid className='productsSlider' columns={columns} gapX='2' gapY='4'>
			{products.map((product) => (
				<Box key={product.id}>
					<ProductCard product={product} />
				</Box>
			))}
		</SimpleGrid>
	);
}
