import { ReactNode } from 'react';
import ChakraUIProvider from '@/components/providers/ChakraUIProvider';
import { Box } from '@chakra-ui/react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { hasLocale } from 'next-intl';
import ToTop from '@/components/reusable/buttons/ToTop';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { loadClientMessages } from '@/utils/i18nUtils';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { ColorModeProvider } from '@/components/reusable/chakra/color-mode';
import { prisma } from '@/lib/prisma';
import { CatalogProvider } from '@/components/providers/CatalogProvider';

interface Props {
	children: ReactNode;
	params: { locale: 'ua' | 'ru' };
}

export default async function Layout({ children, params }: Props) {
	const { locale } = await params;
	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}

	const messages = await loadClientMessages(['General', 'Auth', 'Products', 'Sidebar']);
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	const topLevelCategories = await prisma.productCategory.findMany({
		where: { parentId: null },
		include: {
			children: {
				select: { id: true, name: true, slug: true },
			},
		},
		orderBy: { name: 'asc' },
	});

	return (
		<html lang={locale} suppressHydrationWarning>
			<body>
				<ColorModeProvider>
					<ChakraUIProvider>
						<Box display='flex' flexDirection='column' minHeight='100vh' gap='6' bg='bg.primary'>
							<SessionProvider initialSession={session}>
								<NextIntlClientProvider messages={messages}>
									<CatalogProvider categories={topLevelCategories}>
										<Header />
										<Box as='main' maxWidth='1444px' flex='1' mx='auto' width='100%'>
											{children}
											<ToTop />
										</Box>
									</CatalogProvider>
								</NextIntlClientProvider>
								<Footer />
							</SessionProvider>
						</Box>
					</ChakraUIProvider>
				</ColorModeProvider>
			</body>
		</html>
	);
}
