'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Tabs } from '@chakra-ui/react';

export default function TabsProvider({ children }: { children: ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const segments = pathname.split('/').filter(Boolean);
	const lastSegment = segments[segments.length - 1];
	const locale = segments[0];
	const baseCabinetPath = `/${[locale, 'cabinet'].filter(Boolean).join('/')}`;
	const [value, setValue] = useState<string | null>(lastSegment);

	useEffect(() => {
		if (lastSegment !== value) {
			setValue(lastSegment);
		}
	}, [lastSegment, value]);

	const handleValueChange = (nextValue: string | null) => {
		if (!nextValue) return;
		setValue(nextValue);

		const routes: Record<string, string> = {
			cabinet: baseCabinetPath,
			orders: `${baseCabinetPath}/orders`,
			feedback: `${baseCabinetPath}/feedback`,
			wishlist: `${baseCabinetPath}/wishlist`,
			reviewed: `${baseCabinetPath}/reviewed`,
		};
		const nextRoute = routes[nextValue];
		if (nextRoute && nextRoute !== pathname) {
			router.replace(nextRoute);
		}
	};

	return (
		<Tabs.Root
			colorPalette={{ base: 'orange', _dark: 'yellow' }}
			value={value}
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
