'use client';

import { Box, Flex, Skeleton, SimpleGrid, Stack, HStack } from '@chakra-ui/react';

// Shape mirrors [locale]/products/[category]/[subcategory]/page.tsx:
// breadcrumbs → H1 → filters row → product-card grid.
export default function SubcategoryPageSkeleton() {
	return (
		<Stack mx={{ base: '12px', '2xl': 0 }} gap={8} direction='column'>
			<Flex gap={2} align='center'>
				<Skeleton height='22px' width='60px' rounded='md' />
				<Skeleton height='22px' width='140px' rounded='md' />
				<Skeleton height='22px' width='120px' rounded='md' />
			</Flex>

			<Skeleton height='42px' width={{ base: '60%', md: '360px' }} rounded='md' />

			<HStack gap={3} overflow='hidden'>
				{Array.from({ length: 5 }).map((_, index) => (
					<Skeleton
						key={index}
						height='36px'
						width={{ base: '96px', md: '132px' }}
						rounded='full'
					/>
				))}
			</HStack>

			<SimpleGrid
				columns={{ base: 2, sm: 3, md: 4, lg: 5 }}
				columnGap={{ base: 3, md: 4 }}
				rowGap={4}
			>
				{Array.from({ length: 10 }).map((_, index) => (
					<Box
						key={index}
						borderWidth='0.5px'
						borderStyle='solid'
						borderColor='border'
						rounded='md'
						overflow='hidden'
						bg='bg.tertiary'
						minW='204px'
					>
						<Skeleton height={{ base: '160px', md: '196px' }} rounded='none' />
						<Box p={3}>
							<Skeleton height='16px' width='90%' rounded='md' />
							<Skeleton mt={2} height='16px' width='60%' rounded='md' />
							<Skeleton mt={3} height='14px' width='50%' rounded='md' />
							<Skeleton mt={2} height='14px' width='40%' rounded='md' />
						</Box>
					</Box>
				))}
			</SimpleGrid>
		</Stack>
	);
}
