'use client';

import { ReactNode } from 'react';
import { Tabs } from '@chakra-ui/react';
import { CABINET_TAB_ROUTE_SUFFIXES, type CabinetTabValue } from '@/constants/cabinetTabs';
import { useRouter } from '@/i18n/routing';
import { useSelectedLayoutSegment } from 'next/navigation';

const isCabinetTabValue = (value: string): value is CabinetTabValue =>
	value in CABINET_TAB_ROUTE_SUFFIXES;

export default function TabsProvider({ children }: { children: ReactNode }) {
	const router = useRouter();
	const selectedSegment = useSelectedLayoutSegment();
	const baseCabinetPath = '/cabinet';
	const segmentValue = selectedSegment ?? 'cabinet';

	const currentValue: CabinetTabValue = isCabinetTabValue(segmentValue) ? segmentValue : 'cabinet';

	const handleValueChange = (nextValue: string | null) => {
		if (!nextValue || !isCabinetTabValue(nextValue)) return;
		if (nextValue === currentValue) return;

		const suffix = CABINET_TAB_ROUTE_SUFFIXES[nextValue];
		router.replace(`${baseCabinetPath}${suffix}`);
	};

	return (
		<Tabs.Root
			colorPalette={{ base: 'orange', _dark: 'yellow' }}
			value={currentValue}
			onValueChange={(e) => handleValueChange(e.value)}
			orientation='horizontal'
			variant='line'
			width='full'
			fitted
		>
			{children}
		</Tabs.Root>
	);
}
