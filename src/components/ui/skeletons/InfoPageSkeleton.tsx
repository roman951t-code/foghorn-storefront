'use client';

import { Box, Flex, Skeleton, SkeletonText } from '@chakra-ui/react';

// Shape for static content pages under [locale]/(info)/*:
// H1 → optional intro → paragraphs of text.
export default function InfoPageSkeleton() {
	return (
		<Flex mx={{ base: '12px', '2xl': 0 }} direction='column' gap={5} maxW='4xl'>
			<Skeleton height='38px' width='60%' rounded='md' />
			<Skeleton height='16px' width='80%' rounded='md' />

			<Box mt={4}>
				<SkeletonText noOfLines={5} gap='3' />
			</Box>

			<Box mt={4}>
				<Skeleton height='22px' width='40%' rounded='md' mb={3} />
				<SkeletonText noOfLines={4} gap='3' />
			</Box>

			<Box mt={4}>
				<Skeleton height='22px' width='45%' rounded='md' mb={3} />
				<SkeletonText noOfLines={6} gap='3' />
			</Box>
		</Flex>
	);
}
