'use client';

import { Box, Flex, Skeleton, SimpleGrid, Stack } from '@chakra-ui/react';

// Shape mirrors [locale]/products/[category]/page.tsx:
// breadcrumbs → H1 → category card grid.
export default function CategoryPageSkeleton() {
	return (
		<Stack mx={{ base: '12px', '2xl': 0 }} gap={16} direction='column'>
			<Flex gap={2} align='center'>
				<Skeleton height='22px' width='60px' rounded='md' />
				<Skeleton height='22px' width='140px' rounded='md' />
			</Flex>

			<Stack gapY='8'>
				<Skeleton height='42px' width={{ base: '60%', md: '320px' }} rounded='md' />

				<SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={{ base: 4, md: 6 }}>
					{Array.from({ length: 8 }).map((_, index) => (
						<Box
							key={index}
							borderWidth='0.5px'
							borderStyle='solid'
							borderColor='border'
							rounded='lg'
							overflow='hidden'
							bg='bg.tertiary'
							p={0}
						>
							<Skeleton height='180px' rounded='none' />
							<Box p={4}>
								<Skeleton height='20px' width='80%' rounded='md' />
								<Skeleton mt={2} height='14px' width='55%' rounded='md' />
							</Box>
						</Box>
					))}
				</SimpleGrid>
			</Stack>
		</Stack>
	);
}
