import { Tabs, Flex } from '@chakra-ui/react';
import { ReactNode } from 'react';
import TabsList from './_components/TabsHeaders';
import { type Metadata } from 'next';
import { getLocalizedMetadata } from '@/utils/i18nUtils';
import TabsProvider from './_components/TabsProvider';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

type Params = {
	params: { locale: string };
};

const tabAnimationProps = {
	_open: {
		animationName: 'fade-in, scale-in',
		animationDuration: '300ms',
	},
	_closed: {
		animationName: 'fade-out, scale-out',
		animationDuration: '120ms',
	},
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
	const { locale } = await params;
	return getLocalizedMetadata(locale, 'cabinet');
}

interface Props {
	children: ReactNode;
	params: { locale: 'ua' | 'us' };
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
					<Tabs.Content colorPalette='gray' w='full' value='cabinet' {...tabAnimationProps}>
						{children}
					</Tabs.Content>
					<Tabs.Content colorPalette='gray' w='full' value='orders' {...tabAnimationProps}>
						{children}
					</Tabs.Content>
					<Tabs.Content colorPalette='gray' w='full' value='feedback' {...tabAnimationProps}>
						{children}
					</Tabs.Content>
					<Tabs.Content colorPalette='gray' w='full' value='wishlist' {...tabAnimationProps}>
						{children}
					</Tabs.Content>
					<Tabs.Content colorPalette='gray' w='full' value='reviewed' {...tabAnimationProps}>
						{children}
					</Tabs.Content>
				</Flex>
			</>
		</TabsProvider>
	);
}
