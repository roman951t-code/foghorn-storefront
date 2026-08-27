'use client';

import { Box, Card, Flex, Skeleton, Stack } from '@chakra-ui/react';

// One row's shape mirrors EmptyReviewCard.tsx/ReviewCard.tsx: a 114px
// product thumbnail beside title/category/price lines, with a
// review-button-shaped placeholder on the trailing edge.
function FeedbackCardSkeleton() {
	return (
		<Card.Root
			minWidth='200px'
			w='100%'
			borderWidth='0.5px'
			borderStyle='solid'
			borderColor='border'
			bg='bg.tertiary'
			p='4'
			mb='4'
		>
			<Flex alignItems='center' direction={{ base: 'column', sm: 'row' }} gap='3' w='100%'>
				<Skeleton flexShrink={0} boxSize='114px' rounded='md' />

				<Stack direction='column' gap={2} w='full'>
					<Skeleton height='18px' width='60%' rounded='md' />
					<Skeleton height='14px' width='40%' rounded='md' />
					<Skeleton height='18px' width='30%' rounded='md' />
				</Stack>

				<Skeleton flexShrink={0} height='40px' width={{ base: '100%', md: '140px' }} rounded='md' />
			</Flex>
		</Card.Root>
	);
}

// Shape mirrors UserFeedbackList.tsx: a stack of review/pending-review cards.
export default function CabinetFeedbackSkeleton() {
	return (
		<Box w='100%'>
			{Array.from({ length: 4 }).map((_, index) => (
				<FeedbackCardSkeleton key={index} />
			))}
		</Box>
	);
}
