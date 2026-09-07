import { Flex, HStack, Skeleton, SkeletonCircle, Stack } from '@chakra-ui/react';

// Generic code-split loading fallback for next/dynamic imports (checkout
// steps, product tabs, the auth/personal-data step) — not tied to any one
// page's shape, so it's a small header-line + block placeholder rather than
// a full layout mirror. Uses Chakra's Skeleton (theme tokens under the
// hood) instead of a fixed rgba value so it reads correctly in both themes
// instead of looking washed out in dark mode.
export function LoadingSkeleton() {
	return (
		<Flex direction='column' gap='6' flex='1' minW='0' w='full'>
			<HStack gap='3' w='full'>
				<SkeletonCircle boxSize='40px' />
				<Stack gap='2' w='full'>
					<Skeleton height='12px' width='100%' rounded='md' />
					<Skeleton height='12px' width='72%' rounded='md' />
				</Stack>
			</HStack>
			<Skeleton height='220px' width='100%' rounded='lg' />
		</Flex>
	);
}
