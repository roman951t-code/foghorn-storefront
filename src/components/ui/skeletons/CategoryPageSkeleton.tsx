'use client';

import { Box, Card, Flex, Grid, HStack, Skeleton, Stack } from '@chakra-ui/react';

// Card shape mirrors CategoryCard.tsx: image → title → wrapped tag pills →
// full-width button pinned to the bottom via mt='auto' on a flex-column
// body, so every skeleton card's button lines up at the same height
// regardless of how many pill placeholders it has — same as the real cards.
function CategoryCardSkeleton() {
	return (
		<Card.Root
			w='full'
			h='full'
			borderWidth='1px'
			borderStyle='solid'
			borderColor='border'
			rounded='xl'
			overflow='hidden'
			bg='bg.tertiary'
		>
			<Box position='relative' w='full' aspectRatio={316 / 186}>
				<Skeleton position='absolute' inset='0' rounded='none' />
			</Box>

			{/* Card.Body's recipe already sets flex='1'/display=flex/flexDirection=column
			    by default — see CategoryCard.tsx for why an explicit h='full' here
			    would conflict with that. */}
			<Card.Body gap='3' p={{ base: 4, cardSm: 5 }}>
				<Skeleton height='24px' width='65%' rounded='md' />

				<HStack gap='2' flexWrap='wrap'>
					<Skeleton height='28px' width='96px' rounded='full' />
					<Skeleton height='28px' width='76px' rounded='full' />
					<Skeleton height='28px' width='108px' rounded='full' />
				</HStack>

				<Skeleton mt='auto' height='40px' width='full' rounded='md' />
			</Card.Body>
		</Card.Root>
	);
}

// Shape mirrors [locale]/products/[category]/page.tsx: breadcrumbs → H1 →
// CategoryCards grid. Column breakpoints match CategoryCards.tsx's Grid
// exactly (base:1, cardSm:2, md:3, xl:4), not approximated to Chakra's
// default sm/lg tiers, so the skeleton's column count doesn't jump right
// before the real grid swaps in.
export default function CategoryPageSkeleton() {
	return (
		<Stack mx={{ base: '12px', '2xl': 0 }} gap={16} direction='column'>
			<Flex gap={2} align='center'>
				<Skeleton height='22px' width='60px' rounded='md' />
				<Skeleton height='22px' width='140px' rounded='md' />
			</Flex>

			<Stack gapY='8'>
				<Skeleton height='42px' width={{ base: '60%', md: '320px' }} rounded='md' />

				<Grid
					templateColumns={{
						base: 'repeat(1, 1fr)',
						cardSm: 'repeat(2, 1fr)',
						md: 'repeat(3, 1fr)',
						xl: 'repeat(4, 1fr)',
					}}
					gap='6'
				>
					{Array.from({ length: 8 }).map((_, index) => (
						<CategoryCardSkeleton key={index} />
					))}
				</Grid>
			</Stack>
		</Stack>
	);
}
