import { Tabs, Box } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import TabsList from '@/components/pages/cabinet/TabsHeaders';
import { type Metadata } from 'next';
import { getLocalizedMetadata } from '@/utils/i18nUtils';

type Params = {
	params: { locale: string };
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
	const { locale } = await params;
	return getLocalizedMetadata(locale, 'cabinet');
}

interface Props {
	children: ReactNode;
	params: { locale: 'ua' | 'ru' };
}

export default function CabinetLayout({ children }: Props) {
	const sideT = useTranslations('Sidebar');
	const authT = useTranslations('Auth');

	const i18nData = {
		myOrders: sideT('myOrders'),
		myFeedback: sideT('myFeedback'),
		wishList: sideT('wishList'),
		reviewedProducts: sideT('reviewedProducts'),
		chat: sideT('chat'),
		authorize: authT('authorize'),
		logOut: authT('logOut'),
	};

	return (
		<Tabs.Root
			defaultValue='main'
			colorPalette='orange'
			orientation='vertical'
			variant='line'
			px='3'
		>
			<Box position='sticky' top='74px' h='100%' rounded='sm'>
				<TabsList i18nData={i18nData} />
			</Box>

			<Tabs.Content w='full' value='main'>
				{children}
			</Tabs.Content>
			<Tabs.Content w='full' value={sideT('myOrders')}>
				{children}
			</Tabs.Content>
			<Tabs.Content w='full' value={sideT('myFeedback')}>
				{children}
			</Tabs.Content>
			<Tabs.Content w='full' value={sideT('wishList')}>
				{children}
			</Tabs.Content>
			<Tabs.Content w='full' value={sideT('reviewedProducts')}>
				{children}
			</Tabs.Content>
			<Tabs.Content w='full' value={sideT('chat')}>
				{children}
			</Tabs.Content>
		</Tabs.Root>
	);
}
