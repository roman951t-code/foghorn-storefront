import { Tabs, Box } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import TabsList from '@/components/pages/cabinet/TabsHeaders';

interface Props {
	children: ReactNode;
	params: { locale: 'ua' | 'ru' };
}

export default function CabinetLayout({ children }: Props) {
	const t = useTranslations('Sidebar');

	return (
		<Tabs.Root
			defaultValue='main'
			colorPalette='orange'
			orientation='vertical'
			variant='line'
			px='3'
		>
			<Box position='sticky' top='74px' h='100%' rounded='sm'>
				<TabsList />
			</Box>

			<Tabs.Content w='full' value='main'>
				{children}
			</Tabs.Content>
			<Tabs.Content w='full' value={t('myOrders')}>
				{children}
			</Tabs.Content>
			<Tabs.Content w='full' value={t('myFeedback')}>
				{children}
			</Tabs.Content>
			<Tabs.Content w='full' value={t('wishList')}>
				{children}
			</Tabs.Content>
			<Tabs.Content w='full' value={t('reviewedProducts')}>
				{children}
			</Tabs.Content>
			<Tabs.Content w='full' value={t('chat')}>
				{children}
			</Tabs.Content>
		</Tabs.Root>
	);
}
