import { Flex } from '@chakra-ui/react';
import { ReactNode, Suspense } from 'react';
import TabsList from './_components/TabsHeaders';
import { type Metadata } from 'next';
import { getLocalizedMetadata } from '@/utils/i18nServerUtils';
import TabsProvider from './_components/TabsProvider';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import TabsContentRenderer from './_components/TabsContentRenderer';
import { LocaleParams } from '@/types/routing';
import type { AppLocale } from '@/constants/locales';
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
//
// This is also where next-intl's request-scoped locale cache needs to be
// re-seeded: the root layout's `setRequestLocale` call only covers the
// static-shell render pass. Once this Suspense boundary defers rendering
// (because of the `headers()` read above), everything below re-renders in a
// separate pass that doesn't inherit that cache — so `getTranslations`/
// `useTranslations` calls deeper in `children` would otherwise fall back to
// resolving the locale from `headers()` again, which is itself an uncached
// read outside of this Suspense boundary and reproduces the same error.
async function AuthorizedCabinet({ children, locale }: { children: ReactNode; locale: AppLocale }) {
	setRequestLocale(locale);

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

export default async function CabinetLayout({ children, params }: Props) {
	const { locale } = await params;

	return (
		<Suspense fallback={<CabinetPageSkeleton />}>
			<AuthorizedCabinet locale={locale}>{children}</AuthorizedCabinet>
		</Suspense>
	);
}
