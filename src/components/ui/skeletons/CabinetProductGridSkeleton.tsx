'use client';

import { Box, Skeleton, SimpleGrid } from '@chakra-ui/react';
import { CABINET_PRODUCTS_GRID_CSS, PRODUCT_CARD_HORIZONTAL_GAP } from '@/constants/grids';

// Shared by the wishlist and viewed-products cabinet tabs — both render a
// grid of ProductCard, so this single card shape covers both instead of
// each tab hand-rolling its own.
export function CabinetProductCardSkeleton() {
	return (
		<Box
			borderWidth='0.5px'
			borderStyle='solid'
			borderColor='border'
			rounded='md'
			overflow='hidden'
			bg='bg.tertiary'
		>
			<Skeleton height={{ base: '200px', md: '220px' }} rounded='none' />
			<Box p={3}>
				<Skeleton height='16px' width='90%' rounded='md' />
				<Skeleton mt={2} height='16px' width='60%' rounded='md' />
				<Skeleton mt={3} height='14px' width='50%' rounded='md' />
				<Skeleton mt={2} height='14px' width='40%' rounded='md' />
			</Box>
		</Box>
	);
}

// Both tabs render their grid via CABINET_PRODUCTS_GRID_CSS (see
// src/constants/grids.ts; deliberately not PRODUCTS_GRID_CSS — this grid's
// side margin and column bands differ from the listing pages'), so the
// skeleton reuses that exact CSS object rather than approximating its own
// breakpoints.
export default function CabinetProductGridSkeleton() {
	return (
		<SimpleGrid
			my='4'
			className='productsSlider'
			css={CABINET_PRODUCTS_GRID_CSS}
			columnGap={PRODUCT_CARD_HORIZONTAL_GAP}
			gapY='4'
			w='100%'
		>
			{Array.from({ length: 10 }).map((_, index) => (
				<CabinetProductCardSkeleton key={index} />
			))}
		</SimpleGrid>
	);
}
