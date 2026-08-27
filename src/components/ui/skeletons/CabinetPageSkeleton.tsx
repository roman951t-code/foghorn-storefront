'use client';

import { Flex, HStack, Skeleton } from '@chakra-ui/react';
import CabinetPageContentSkeleton from './CabinetPageContentSkeleton';

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

			<CabinetPageContentSkeleton />
		</Flex>
	);
}
