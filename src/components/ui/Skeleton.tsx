import {
	HStack,
	SimpleGrid,
	Skeleton,
	SkeletonCircle,
	SkeletonText,
	Stack,
} from '@chakra-ui/react';

export function LoadingPromoSkeleton() {
	return (
		<Stack gap='6' flex='1' minW='0' h='100%'>
			<HStack width='full'>
				<SkeletonCircle size='10' />
				<SkeletonText noOfLines={2} />
			</HStack>
			<Skeleton height='220px' h='100%' />
		</Stack>
	);
}

export function LoadingSkeleton() {
	return (
		<Stack gap='6' flex='1' minW='0' h='100%'>
			<HStack width='full'>
				<SkeletonCircle size='10' />
				<SkeletonText noOfLines={2} />
			</HStack>
			<Skeleton height='220px' />
		</Stack>
	);
}

export function ProductPreviewSkeleton() {
	return (
		<HStack overflowX='hidden' overflowY='hidden' alignSelf='center'>
			<Skeleton width='116px' height='116px' borderRadius='lg' />
		</HStack>
	);
}

export function Loading() {
	return (
		<SimpleGrid columns={2} columnGap='4' rowGap='4' mt='100px'>
			<LoadingSkeleton />
			<LoadingSkeleton />
			<LoadingSkeleton />
			<LoadingSkeleton />
		</SimpleGrid>
	);
}
