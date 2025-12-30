'use client';

import { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Tabs } from '@chakra-ui/react';
import { CABINET_TAB_ROUTE_SUFFIXES, type CabinetTabValue } from '@/constants/cabinetTabs';

const isCabinetTabValue = (value: string): value is CabinetTabValue =>
	value in CABINET_TAB_ROUTE_SUFFIXES;

export default function TabsProvider({ children }: { children: ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const segments = pathname.split('/').filter(Boolean);
	const lastSegment = segments[segments.length - 1];
	const locale = segments[0];
	const baseCabinetPath = `/${[locale, 'cabinet'].filter(Boolean).join('/')}`;

	const currentValue: CabinetTabValue = isCabinetTabValue(lastSegment) ? lastSegment : 'cabinet';

	const handleValueChange = (nextValue: string | null) => {
		if (!nextValue || !isCabinetTabValue(nextValue)) return;

		const suffix = CABINET_TAB_ROUTE_SUFFIXES[nextValue];
		const nextRoute = `${baseCabinetPath}${suffix}`;
		if (nextRoute !== pathname) {
			router.replace(nextRoute);
		}
	};

	return (
		<Tabs.Root
			colorPalette={{ base: 'orange', _dark: 'yellow' }}
			value={currentValue}
			onValueChange={(e) => handleValueChange(e.value)}
			orientation='horizontal'
			width='full'
			lazyMount
			fitted
		>
			{children}
		</Tabs.Root>
	);
}
