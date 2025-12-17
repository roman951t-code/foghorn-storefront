import { Flex } from '@chakra-ui/react';
import { ReactNode } from 'react';
import TabsList from './_components/TabsHeaders';
import { type Metadata } from 'next';
import { getLocalizedMetadata } from '@/utils/i18nUtils';
import TabsProvider from './_components/TabsProvider';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { AppLocale } from '@/constants/locales';
import TabsContentRenderer from './_components/TabsContentRenderer';

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
					<TabsContentRenderer>{children}</TabsContentRenderer>
				</Flex>
			</>
		</TabsProvider>
	);
}
