'use client';

import { ReactNode, Suspense, useMemo } from 'react';
import { Tabs, SimpleGrid, Box } from '@chakra-ui/react';
import { useSearchParams } from 'next/navigation';
import { CABINET_TABS, TAB_ANIMATION_PROPS, type CabinetTabValue } from '@/constants/cabinetTabs';
import { LoadingSkeleton } from '@/components/ui/Skeleton';
import { usePathname } from '@/i18n/routing';

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
	const searchParams = useSearchParams();
	const suspenseKey = useMemo(() => {
		const query = searchParams.toString();
		return query ? `${pathname}?${query}` : pathname;
	}, [pathname, searchParams]);
	const currentTab = useMemo<CabinetTabValue>(() => {
		const segments = pathname?.split('/').filter(Boolean) ?? [];
		const lastSegment = segments[segments.length - 1] as CabinetTabValue | undefined;
		const isKnownTab = CABINET_TABS.some((tab) => tab.value === lastSegment);
		return isKnownTab && lastSegment ? lastSegment : 'cabinet';
	}, [pathname]);

	return (
		<>
			{CABINET_TABS.map((tab) => (
				<Tabs.Content
					key={tab.value}
					value={tab.value}
					colorPalette='gray'
					w='full'
					flex='1'
					minW='0'
					{...TAB_ANIMATION_PROPS}
				>
					{tab.value === currentTab ? (
						<Suspense key={suspenseKey} fallback={<CabinetTabSkeleton />}>
							{children}
						</Suspense>
					) : null}
				</Tabs.Content>
			))}
		</>
	);
}
