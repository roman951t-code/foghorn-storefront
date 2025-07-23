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
				columns={{ base: 1, prodXs: 2, prodSm: 3, prodMd: 4, prodLg: 5, prodXl: 6 } as any}
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
