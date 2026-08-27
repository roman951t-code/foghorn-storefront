'use client';

import { Box, Flex, HStack, Skeleton, SkeletonText, SkeletonCircle, Stack } from '@chakra-ui/react';

// Shape mirrors [locale]/products/[category]/[subcategory]/[product]/page.tsx:
// breadcrumbs → tabs → 2-column (gallery + info panel) → description → related.
export default function ProductDetailPageSkeleton() {
	return (
		<Flex mx={{ base: '18px', '2xl': 0 }} gap={6} direction='column'>
			<Flex gap={2} align='center'>
				<Skeleton height='22px' width='60px' rounded='md' />
				<Skeleton height='22px' width='140px' rounded='md' />
				<Skeleton height='22px' width='120px' rounded='md' />
				<Skeleton height='22px' width='160px' rounded='md' />
			</Flex>

			<HStack gap={6} borderBottomWidth='0.5px' borderColor='border' pb={2}>
				<Skeleton height='28px' width='120px' rounded='md' />
				<Skeleton height='28px' width='140px' rounded='md' />
				<Skeleton height='28px' width='90px' rounded='md' />
			</HStack>

			<Flex gap={6} direction={{ base: 'column', lg: 'row' }}>
				<Stack flex='1' minW={0} gap={3}>
					<Skeleton w='100%' h={{ base: '320px', md: '440px', xl: '520px' }} rounded='md' />
					<HStack gap={2}>
						{Array.from({ length: 4 }).map((_, index) => (
							<Skeleton key={index} boxSize={{ base: '60px', md: '80px' }} rounded='md' />
						))}
					</HStack>
				</Stack>

				<Stack flex='1' minW={0} gap={4}>
					<Skeleton height='36px' width='75%' rounded='md' />

					<HStack gap={3}>
						<SkeletonCircle boxSize='4' />
						<Skeleton height='16px' width='120px' rounded='md' />
						<Skeleton height='16px' width='120px' rounded='md' />
					</HStack>

					<HStack gap={2}>
						<Skeleton height='14px' width='100px' rounded='md' />
						<Skeleton height='14px' width='140px' rounded='md' />
					</HStack>

					<Stack gap={2}>
						<Skeleton height='14px' width='60px' rounded='md' />
						<HStack gap={2}>
							{Array.from({ length: 3 }).map((_, index) => (
								<Skeleton key={index} height='36px' width='56px' rounded='md' />
							))}
						</HStack>
					</Stack>

					<Box
						mt={2}
						p={4}
						borderWidth='0.5px'
						borderStyle='solid'
						borderColor='border'
						rounded='lg'
						bg='bg.tertiary'
					>
						<HStack justify='space-between' align='center'>
							<Skeleton height='40px' width='60%' rounded='md' />
							<Skeleton height='40px' width='30%' rounded='md' />
						</HStack>
						<Stack mt={4} gap={2}>
							<Skeleton height='32px' width='100%' rounded='md' />
							<Skeleton height='32px' width='100%' rounded='md' />
							<Skeleton height='32px' width='100%' rounded='md' />
						</Stack>
					</Box>
				</Stack>
			</Flex>

			<Box mt={4}>
				<Skeleton height='24px' width='120px' rounded='md' mb={3} />
				<SkeletonText noOfLines={4} gap='3' />
			</Box>
		</Flex>
	);
}
