'use client';

import { ReactNode } from 'react';
import { Tabs } from '@chakra-ui/react';
import { useSelectedLayoutSegment } from 'next/navigation';
import { CABINET_TAB_ROUTE_SUFFIXES, type CabinetTabValue } from '@/constants/cabinetTabs';

const isCabinetTabValue = (value: string): value is CabinetTabValue =>
	value in CABINET_TAB_ROUTE_SUFFIXES;

export default function TabsContentRenderer({ children }: { children: ReactNode }) {
	const selectedSegment = useSelectedLayoutSegment();
	const segmentValue = selectedSegment ?? 'cabinet';
	const currentTab: CabinetTabValue = isCabinetTabValue(segmentValue) ? segmentValue : 'cabinet';

	return (
		<Tabs.Content value={currentTab} w='full' flex='1' minW='0'>
			{children}
		</Tabs.Content>
	);
}
