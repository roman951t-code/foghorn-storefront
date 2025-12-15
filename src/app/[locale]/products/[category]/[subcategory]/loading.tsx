import { LoadingSkeleton } from '@/components/ui/Skeleton';
import { SimpleGrid, Box } from '@chakra-ui/react';

export default function Loading() {
	return (
		<SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap='4' px='4' mt='10%'>
			<Box minW='0'>
				<LoadingSkeleton />
			</Box>
			<Box minW='0'>
				<LoadingSkeleton />
			</Box>
			<Box minW='0'>
				<LoadingSkeleton />
			</Box>
		</SimpleGrid>
	);
}
