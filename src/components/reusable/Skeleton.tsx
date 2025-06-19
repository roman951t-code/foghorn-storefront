import { HStack, Skeleton, SkeletonCircle, SkeletonText, Stack } from '@chakra-ui/react';

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
