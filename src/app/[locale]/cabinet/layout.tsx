import { Tabs, Box, Flex } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import TabsList from '@/components/pages/cabinet/TabsHeaders';
import { type Metadata } from 'next';
import { getLocalizedMetadata } from '@/utils/i18nUtils';
import TabsProvider from '@/components/pages/cabinet/TabsProvider';

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
		<TabsProvider>
			<>
				<Box position='sticky' zIndex='1000' bg='bg.dark' top='66px' rounded='md'>
					<TabsList i18nData={i18nData} />
				</Box>
				<Flex px='4'>
					<Tabs.Content w='full' value='cabinet'>
						{children}
					</Tabs.Content>
					<Tabs.Content w='full' value={'orders'}>
						{children}
					</Tabs.Content>
					<Tabs.Content w='full' value={'feedback'}>
						{children}
					</Tabs.Content>
					<Tabs.Content w='full' value={'wishlist'}>
						{children}
					</Tabs.Content>
					<Tabs.Content w='full' value={'reviewed'}>
						{children}
					</Tabs.Content>
					<Tabs.Content w='full' value={'chat'}>
						{children}
					</Tabs.Content>
				</Flex>
			</>
		</TabsProvider>
	);
}
