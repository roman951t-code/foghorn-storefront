import { EmptyState, List, VStack } from '@chakra-ui/react';
import { HiColorSwatch } from 'react-icons/hi';
import { SimpleGrid, Box } from '@chakra-ui/react';
import ProductCard from '../../reusable/cards/ProductCard';

export default function ProductsGrid() {
	return (
		<>
			{/* <EmptyState.Root>
			<EmptyState.Content>
				<EmptyState.Indicator>
					<HiColorSwatch />
				</EmptyState.Indicator>
				<VStack textAlign='center'>
					<EmptyState.Title>No results found</EmptyState.Title>
				</VStack>
			</EmptyState.Content>
		</EmptyState.Root> */}
			<SimpleGrid
				className='productsSlider'
				columns={{ base: 1, xs: 2, md: 3, xl: 4 } as any}
				gap='2'
			>
				{new Array(9).fill(null).map((_, index) => (
					<Box key={index}>
						<ProductCard isSliderEnabled />
					</Box>
				))}
			</SimpleGrid>
		</>
	);
}
