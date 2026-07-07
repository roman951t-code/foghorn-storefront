'use client';

import { Box, HStack, Skeleton, Stack, VStack } from '@chakra-ui/react';

// Shape mirrors the form/list area of [locale]/cabinet/*/page.tsx, without
// the tab list (already covered by CabinetPageSkeleton at the layout level).
export default function CabinetPageContentSkeleton() {
	return (
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
	);
}
