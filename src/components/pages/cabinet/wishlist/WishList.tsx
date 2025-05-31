import { EmptyState, List, VStack } from '@chakra-ui/react';
import { HiColorSwatch } from 'react-icons/hi';
import { SimpleGrid, Box } from '@chakra-ui/react';
import ProductCard from '@/components/reusable/cards/ProductCard';

export default function WishList() {
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
				my='4'
				className='productsSlider'
				columns={{ base: 1, sm: 2, lg: 3, xl: 4 }}
				gap='2'
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
