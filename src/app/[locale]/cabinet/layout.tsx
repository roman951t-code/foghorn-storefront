import { Tabs, Flex } from '@chakra-ui/react';
import { ReactNode } from 'react';
import TabsList from './_components/TabsHeaders';
import { type Metadata } from 'next';
import { getLocalizedMetadata } from '@/utils/i18nUtils';
import TabsProvider from './_components/TabsProvider';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { TAB_ANIMATION_PROPS } from '@/constants/cabinetTabs';
import type { AppLocale } from '@/constants/locales';

type Params = {
	params: { locale: string };
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
	const { locale } = await params;
	return getLocalizedMetadata(locale, 'cabinet', {
		pathname: '/cabinet',
		robots: { index: false, follow: false },
	});
}

interface Props {
	children: ReactNode;
	params: { locale: AppLocale };
}

export default async function CabinetLayout({ children }: Props) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect('/');
	}

	return (
		<TabsProvider>
			<>
				<TabsList />
				<Flex px='4'>
					<Tabs.Content colorPalette='gray' w='full' value='cabinet' {...TAB_ANIMATION_PROPS}>
						{children}
					</Tabs.Content>
					<Tabs.Content colorPalette='gray' w='full' value='orders' {...TAB_ANIMATION_PROPS}>
						{children}
					</Tabs.Content>
					<Tabs.Content colorPalette='gray' w='full' value='feedback' {...TAB_ANIMATION_PROPS}>
						{children}
					</Tabs.Content>
					<Tabs.Content colorPalette='gray' w='full' value='wishlist' {...TAB_ANIMATION_PROPS}>
						{children}
					</Tabs.Content>
					<Tabs.Content colorPalette='gray' w='full' value='reviewed' {...TAB_ANIMATION_PROPS}>
						{children}
					</Tabs.Content>
				</Flex>
			</>
		</TabsProvider>
	);
}
