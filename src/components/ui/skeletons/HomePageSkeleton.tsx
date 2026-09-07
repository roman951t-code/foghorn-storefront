'use client';

import { Box, Flex, Skeleton, SimpleGrid } from '@chakra-ui/react';

function ProductRowSkeleton() {
	return (
		<Flex gap={6} direction='column' mt={28}>
			<Skeleton height='28px' width='220px' rounded='md' />
			<SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5 }} gap={{ base: 4, md: 6 }}>
				{Array.from({ length: 5 }).map((_, index) => (
					<Box key={index}>
						<Skeleton height='160px' rounded='lg' />
						<Skeleton mt={2} height='16px' width='80%' rounded='md' />
						<Skeleton mt={2} height='14px' width='50%' rounded='md' />
					</Box>
				))}
			</SimpleGrid>
		</Flex>
	);
}

// Shape mirrors [locale]/page.tsx: catalog panel banner → four product
// sliders (popular/new/discount/promotional) → subscribe section.
export default function HomePageSkeleton() {
	return (
		<Flex mx={{ base: '18px', '2xl': 0 }} direction='column'>
			<Skeleton height={{ base: '220px', md: '360px' }} rounded='xl' />

			<ProductRowSkeleton />
			<ProductRowSkeleton />
			<ProductRowSkeleton />
			<ProductRowSkeleton />

			<Skeleton mt={28} height='200px' rounded='xl' />
		</Flex>
	);
}
