import { Flex } from '@chakra-ui/react';
import { ReactNode, Suspense } from 'react';
import TabsList from './_components/TabsHeaders';
import { type Metadata } from 'next';
import { getLocalizedMetadata } from '@/utils/i18nServerUtils';
import TabsProvider from './_components/TabsProvider';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import TabsContentRenderer from './_components/TabsContentRenderer';
import { LocaleParams } from '@/types/routing';
import CabinetPageSkeleton from '@/components/ui/skeletons/CabinetPageSkeleton';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
	const { locale } = await params;
	return getLocalizedMetadata(locale, 'cabinet', {
		pathname: '/cabinet',
		robots: { index: false, follow: false },
	});
}

type Props = LocaleParams & { children: ReactNode };

// The session check needs `headers()`, which is a runtime-only read. Since
// `loading.tsx` only wraps the *page* slot, not this layout's own body, that
// read was still happening above/outside any Suspense boundary and blocked
// prerendering for the whole route (see blocking-route warning). Moving it
// into its own component wrapped in <Suspense> here contains the dynamic
// hole to just this subtree.
async function AuthorizedCabinet({ children }: { children: ReactNode }) {
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

export default async function CabinetLayout({ children }: Props) {
	return (
		<Suspense fallback={<CabinetPageSkeleton />}>
			<AuthorizedCabinet>{children}</AuthorizedCabinet>
		</Suspense>
	);
}
