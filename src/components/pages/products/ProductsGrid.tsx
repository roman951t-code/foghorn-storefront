import { EmptyState, VStack } from '@chakra-ui/react';
import { HiColorSwatch } from 'react-icons/hi';
import { SimpleGrid, Box } from '@chakra-ui/react';
import ProductCard from '../../reusable/cards/ProductCard';

export default function ProductsGrid({ notFound }: { notFound: string }) {
	return (
		<>
			{/* <EmptyState.Root>
				<EmptyState.Content>
					<EmptyState.Indicator>
						<HiColorSwatch />
					</EmptyState.Indicator>
					<VStack textAlign='center'>
						<EmptyState.Title>{notFound}</EmptyState.Title>
					</VStack>
				</EmptyState.Content>
			</EmptyState.Root> */}
			<SimpleGrid
				className='productsSlider'
				columns={{ base: 1, prodXs: 2, prodSm: 3, prodLg: 4, prodXl: 5 } as any}
				gapX='2'
				gapY='4'
			>
				{new Array(9).fill(null).map((_, index) => (
					<Box key={index}>
						<ProductCard />
					</Box>
				))}
			</SimpleGrid>
		</>
	);
}
