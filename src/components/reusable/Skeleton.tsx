import { HStack, Skeleton, SkeletonCircle, SkeletonText, Stack } from '@chakra-ui/react';

export default function LoadingSkeleton() {
	return (
		<Stack gap='6' minW='300px'>
			<HStack width='full'>
				<SkeletonCircle size='10' />
				<SkeletonText noOfLines={2} />
			</HStack>
			<Skeleton height='200px' />
		</Stack>
	);
}
