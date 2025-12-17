'use client';

import { ReactNode, Suspense, useMemo } from 'react';
import { Tabs, SimpleGrid, Box } from '@chakra-ui/react';
import { usePathname } from 'next/navigation';
import { CABINET_TABS, TAB_ANIMATION_PROPS, type CabinetTabValue } from '@/constants/cabinetTabs';
import { LoadingSkeleton } from '@/components/ui/Skeleton';

function CabinetTabSkeleton() {
	return (
		<SimpleGrid
			mt='8'
			mb='4'
			columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
			gapX='2'
			gapY='4'
			w='100%'
		>
			{Array.from({ length: 4 }).map((_, index) => (
				<Box key={`cabinet-tab-skeleton-${index}`}>
					<LoadingSkeleton />
				</Box>
			))}
		</SimpleGrid>
	);
}

export default function TabsContentRenderer({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	const currentTab = useMemo<CabinetTabValue>(() => {
		const segments = pathname?.split('/').filter(Boolean) ?? [];
		const lastSegment = segments[segments.length - 1] as CabinetTabValue | undefined;
		const isKnownTab = CABINET_TABS.some((tab) => tab.value === lastSegment);
		return isKnownTab && lastSegment ? lastSegment : 'cabinet';
	}, [pathname]);

	const renderSlot = (tabValue: CabinetTabValue) => {
		const isActive = tabValue === currentTab;
		return isActive ? (
			<Suspense key={currentTab} fallback={<CabinetTabSkeleton />}>
				{children}
			</Suspense>
		) : (
			<CabinetTabSkeleton />
		);
	};

	return (
		<>
			{CABINET_TABS.map((tab) => (
				<Tabs.Content
					key={tab.value}
					colorPalette='gray'
					w='full'
					value={tab.value}
					{...TAB_ANIMATION_PROPS}
				>
					{renderSlot(tab.value)}
				</Tabs.Content>
			))}
		</>
	);
}
