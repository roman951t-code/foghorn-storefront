// src/app/layout.tsx
import { ReactNode } from 'react';
import pick from 'lodash.pick';
import { ColorModeProvider } from '@/components/ui/color-mode';
import ChakraUIProvider from '@/components/providers/ChakraUIProvider';
import { Box } from '@chakra-ui/react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { hasLocale } from 'next-intl';
import ToTop from '@/components/reusable/buttons/ToTop';
import AuthProvider from '@/components/providers/AuthProvider';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { loadClientMessages } from '@/utils/i18nUtils';

interface Props {
	children: ReactNode;
	params: { locale: 'ua' | 'ru' };
}

export default async function Layout({ children, params }: Props) {
	const { locale } = await params;
	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}

	const messages = await loadClientMessages(['Sidebar', 'Auth', 'General', 'Error']);

	return (
		<html lang={locale} suppressHydrationWarning>
			<head />
			<body>
				<NextIntlClientProvider messages={messages}>
					<ColorModeProvider>
						<ChakraUIProvider>
							<AuthProvider>
								<Box
									display='flex'
									flexDirection='column'
									minHeight='100vh'
									gap='6'
									bg='bg.primary'
									overflow='hidden'
								>
									<Header />
									<Box as='main' maxWidth='1444px' flex='1' mx='auto' width='100%'>
										<div id='root'>{children}</div>
										{/* <ToTop /> */}
									</Box>
									<Footer />
								</Box>
							</AuthProvider>
						</ChakraUIProvider>
					</ColorModeProvider>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
