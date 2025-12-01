'use client';
import { SimpleGrid, Box, VStack, useMediaQuery } from '@chakra-ui/react';
import { EmptyState } from '@chakra-ui/react';
import { HiColorSwatch } from 'react-icons/hi';
import ProductCard from '@/features/product/cards/ProductCard';
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

	const [is1340, is1100, is960, is860, is630, is450] = useMediaQuery([
		'(min-width: 1340px)',
		'(min-width: 1100px)',
		'(min-width: 960px)',
		'(min-width: 860px)',
		'(min-width: 630px)',
		'(min-width: 450px)',
	]);

	let columns = 1;
	if (is1340) columns = 5;
	else if (is1100) columns = 4;
	else if (is960) columns = 3;
	else if (is860) columns = 4;
	else if (is630) columns = 3;
	else if (is450) columns = 2;

	return (
		<SimpleGrid
			className='productsSlider'
			columns={columns}
			columnGap={2}
			rowGap={4}
			px={{ base: 1, sm: 0 }}
		>
			{products.map((product) => (
				<Box key={product.id}>
					<ProductCard product={product} />
				</Box>
			))}
		</SimpleGrid>
	);
}
