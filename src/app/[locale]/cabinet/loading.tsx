import { LoadingSkeleton } from '@/components/ui/Skeleton';
import { HStack } from '@chakra-ui/react';

export default function Loading() {
	return (
		<HStack gap='4' px='4'>
			<LoadingSkeleton />
			<LoadingSkeleton />
			<LoadingSkeleton />
		</HStack>
	);
}
