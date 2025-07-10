'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Tabs } from '@chakra-ui/react';

export default function TabsProvider({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	const segments = pathname.split('/').filter(Boolean);
	const lastSegment = segments[segments.length - 1];
	const [value, setValue] = useState<string | null>(lastSegment);

	useEffect(() => {
		if (lastSegment !== value) {
			setValue(lastSegment);
		}
	}, [lastSegment]);

	return (
		<Tabs.Root
			colorPalette={{ base: 'orange', _dark: 'yellow' }}
			value={value}
			onValueChange={(e) => setValue(e.value)}
			orientation='horizontal'
			width='full'
			lazyMount
			fitted
		>
			{children}
		</Tabs.Root>
	);
}
