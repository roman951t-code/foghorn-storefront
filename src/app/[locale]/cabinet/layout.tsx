import { Tabs, Box, Flex } from '@chakra-ui/react';
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
				<Box bg='bg.tertiary' zIndex='1' rounded='md'>
					<TabsList />
				</Box>
				<Flex px='4'>
					<Tabs.Content w='full' value='cabinet'>
						{children}
					</Tabs.Content>
					<Tabs.Content w='full' value='orders'>
						{children}
					</Tabs.Content>
					<Tabs.Content w='full' value='feedback'>
						{children}
					</Tabs.Content>
					<Tabs.Content w='full' value='wishlist'>
						{children}
					</Tabs.Content>
					<Tabs.Content w='full' value='reviewed'>
						{children}
					</Tabs.Content>
				</Flex>
			</>
		</TabsProvider>
	);
}
