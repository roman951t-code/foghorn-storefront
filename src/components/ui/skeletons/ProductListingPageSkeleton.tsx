'use client';

import { Box, Flex, Grid, Group, HStack, Skeleton, VStack } from '@chakra-ui/react';
import { PRODUCT_CARD_HORIZONTAL_GAP, PRODUCTS_GRID_CSS } from '@/constants/grids';

const sectionBoxStyle = {
	rounded: 'lg',
	bg: 'bg.tertiary',
	p: 4,
	w: '100%',
	borderWidth: '0.5px',
	borderStyle: 'solid' as const,
	borderColor: 'border',
};

function FilterSectionSkeleton({ rows }: { rows: number }) {
	return (
		<Box {...sectionBoxStyle}>
			<HStack gap={2} mb={3}>
				<Box w='4px' h='16px' rounded='full' bg='orange.400' />
				<Skeleton height='12px' width='80px' rounded='md' />
			</HStack>
			<VStack gap={2} alignItems='stretch'>
				{Array.from({ length: rows }).map((_, index) => (
					<Skeleton key={index} height='40px' width='100%' rounded='lg' />
				))}
			</VStack>
		</Box>
	);
}

function ProductCardSkeleton() {
	return (
		<Box
			borderWidth='0.5px'
			borderStyle='solid'
			borderColor='border'
			rounded='md'
			overflow='hidden'
			bg='bg.tertiary'
		>
			<Skeleton height='220px' rounded='none' />
			<Box p={3}>
				<Skeleton height='16px' width='90%' rounded='md' />
				<Skeleton mt={2} height='16px' width='60%' rounded='md' />
				<Skeleton mt={3} height='14px' width='50%' rounded='md' />
				<Skeleton mt={2} height='14px' width='40%' rounded='md' />
			</Box>
		</Box>
	);
}

type Props = {
	// Only the subcategory page renders a breadcrumb trail above its H1 —
	// the search page's H1 is the first thing on the page.
	showBreadcrumbs?: boolean;
	// Only the search page's sidebar has a "SearchCategories" chip row
	// (matched subcategories) between the total-products pill and the quick
	// filters.
	showCategoryChips?: boolean;
};

// Shared shape for [locale]/products/search/page.tsx and
// [locale]/products/[category]/[subcategory]/page.tsx: both render
// breadcrumbs (subcategory only) → H1 → mobile filter button → sidebar
// (catalog button, total-products pill, [category chips], quick filters,
// filter groups) + product grid. One skeleton for both keeps the loading
// state from drifting out of sync with either page again — the grid reuses
// PRODUCTS_GRID_CSS/PRODUCT_CARD_HORIZONTAL_GAP directly (not hand-rolled
// breakpoints) so column counts line up exactly with the real ProductsGrid
// once it swaps in (see src/constants/grids.ts for why that math isn't
// safe to approximate or scale).
export default function ProductListingPageSkeleton({
	showBreadcrumbs = false,
	showCategoryChips = false,
}: Props) {
	return (
		<Flex mx={{ base: '18px', '2xl': 0 }} gap={8} direction='column'>
			{showBreadcrumbs && (
				<Flex gap={2} align='center'>
					<Skeleton height='22px' width='60px' rounded='md' />
					<Skeleton height='22px' width='140px' rounded='md' />
					<Skeleton height='22px' width='120px' rounded='md' />
				</Flex>
			)}

			<Skeleton height='42px' width={{ base: '70%', md: '360px' }} rounded='md' />

			<Flex hideFrom='lg' justifyContent='flex-end'>
				<Skeleton height='44px' width='140px' rounded='md' />
			</Flex>

			<Group justifyContent='space-between' align='flex-start' gap='3'>
				<Box
					as='aside'
					w='304px'
					flexShrink={0}
					bg='bg.tertiary'
					minH='800px'
					rounded='lg'
					hideBelow='lg'
				>
					<Skeleton height='44px' m='4' rounded='md' />

					<VStack p='4' pt='0' gap='4' alignItems='stretch'>
						<HStack w='full' gapX='4' align='center'>
							<Skeleton height='16px' width='100px' rounded='md' />
							<Skeleton height='24px' width='36px' rounded='full' />
						</HStack>

						{showCategoryChips && (
							<HStack gap='2' flexWrap='wrap'>
								{Array.from({ length: 4 }).map((_, index) => (
									<Skeleton key={index} height='28px' width='84px' rounded='full' />
								))}
							</HStack>
						)}

						<FilterSectionSkeleton rows={3} />
						<FilterSectionSkeleton rows={3} />
						<FilterSectionSkeleton rows={2} />
						<FilterSectionSkeleton rows={4} />
					</VStack>
				</Box>

				<Box as='section' w='100%' flex='1' minW={0}>
					<Grid columnGap={PRODUCT_CARD_HORIZONTAL_GAP} rowGap={4} css={PRODUCTS_GRID_CSS}>
						{Array.from({ length: 12 }).map((_, index) => (
							<ProductCardSkeleton key={index} />
						))}
					</Grid>
				</Box>
			</Group>
		</Flex>
	);
}
