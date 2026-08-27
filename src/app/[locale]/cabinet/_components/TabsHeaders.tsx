'use client';
import { Tabs, Icon } from '@chakra-ui/react';
import { useSession } from '@/providers/SessionProvider';
import { useTranslations } from 'next-intl';
import { CABINET_TABS, CABINET_TAB_TRIGGER_PROPS } from '@/constants/cabinetTabs';

export default function TabsList() {
	const navT = useTranslations('navigation');
	const { session } = useSession();

	return (
		<Tabs.List mt='4' mb='4' gapX='4' rowGap='3' flexWrap='wrap' justifyContent='center' w='full'>
			{CABINET_TABS.map((tab) => {
				const IconComponent = tab.icon;
				const label = tab.usesName
					? (session?.user?.name ?? navT(tab.labelKey))
					: navT(tab.labelKey);

				return (
					<Tabs.Trigger
						key={tab.value}
						value={tab.value}
						_hover={{ opacity: 1, transition: '0.3s ease all' }}
						{...CABINET_TAB_TRIGGER_PROPS}
					>
						<Icon as={IconComponent} fontSize='md' />
						{label}
					</Tabs.Trigger>
				);
			})}
		</Tabs.List>
	);
}
