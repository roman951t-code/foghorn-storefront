'use client';

import { Box, Flex, HStack, Skeleton, Stack, VStack } from '@chakra-ui/react';

// Shape mirrors [locale]/cabinet/layout.tsx + page.tsx:
// horizontal tab list → main form area (label/input rows).
export default function CabinetPageSkeleton() {
	return (
		<Flex direction='column' gap={6} px={{ base: 3, md: 4 }} py={4}>
			<HStack gap={2} overflow='hidden'>
				{Array.from({ length: 5 }).map((_, index) => (
					<Skeleton key={index} height='36px' width='120px' rounded='full' />
				))}
			</HStack>

			<VStack w='100%' maxW='6xl' mx='auto' align='stretch' gap={5}>
				<Skeleton height='28px' width='240px' rounded='md' />

				<Box
					borderWidth='0.5px'
					borderStyle='solid'
					borderColor='border'
					rounded='lg'
					bg='bg.tertiary'
					p={{ base: 4, md: 6 }}
				>
					<Stack gap={4}>
						{Array.from({ length: 5 }).map((_, index) => (
							<Stack key={index} gap={2}>
								<Skeleton height='14px' width='140px' rounded='md' />
								<Skeleton height='40px' width='100%' rounded='md' />
							</Stack>
						))}

						<HStack justify='flex-end' gap={3} mt={2}>
							<Skeleton height='40px' width='120px' rounded='md' />
							<Skeleton height='40px' width='120px' rounded='md' />
						</HStack>
					</Stack>
				</Box>
			</VStack>
		</Flex>
	);
}
