'use client';

import { Card, Flex, HStack, Skeleton, VStack } from '@chakra-ui/react';

// One order card's shape mirrors OrderAccordionTrigger.tsx: total/count/
// discount stack on the left, product thumbnails, a date tag, then a row of
// status/payment/shipment tags underneath.
function OrderCardSkeleton() {
	return (
		<Card.Root
			minWidth='200px'
			borderWidth='0.5px'
			borderStyle='solid'
			borderColor='border'
			bg='bg.tertiary'
			p='4'
			mb='6'
		>
			<Flex w='full' alignItems='flex-start' justifyContent='space-between' direction='column' gap='3'>
				<VStack gap='3' alignItems='flex-start' minW='160px'>
					<Skeleton height='14px' width='90px' rounded='md' />
					<Skeleton height='30px' width='140px' rounded='md' />
					<HStack gap='2'>
						<Skeleton height='16px' width='110px' rounded='md' />
						<Skeleton height='20px' width='28px' rounded='full' />
					</HStack>
				</VStack>

				<HStack gap='2' display={{ base: 'none', md: 'flex' }}>
					{Array.from({ length: 3 }).map((_, index) => (
						<Skeleton key={index} boxSize='114px' rounded='md' />
					))}
				</HStack>

				<Skeleton height='36px' width='154px' rounded='md' />
			</Flex>

			<HStack gap='3' mt='4' flexWrap='wrap'>
				<Skeleton height='34px' width='150px' rounded='md' />
				<Skeleton height='34px' width='150px' rounded='md' />
				<Skeleton height='34px' width='170px' rounded='md' />
			</HStack>
		</Card.Root>
	);
}

// Shape mirrors UserOrdersList.tsx: a stack of order cards.
export default function CabinetOrdersSkeleton() {
	return (
		<VStack w='100%' mt='4' gap={0} alignItems='stretch'>
			{Array.from({ length: 3 }).map((_, index) => (
				<OrderCardSkeleton key={index} />
			))}
		</VStack>
	);
}
