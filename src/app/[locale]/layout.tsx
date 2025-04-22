// src/app/layout.tsx
import { ReactNode } from 'react';
import { ColorModeProvider } from '@/components/ui/color-mode';
import ChakraUIProvider from '@/components/providers/ChakraUIProvider';
import { Box } from '@chakra-ui/react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import ToTop from '@/components/reusable/buttons/ToTop';
import AuthProvider from '@/components/providers/AuthProvider';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

interface Props {
	children: ReactNode;
	params: { locale: 'ua' | 'ru' };
}

export default async function Layout({ children, params }: Props) {
	const { locale } = await params;

	if (!routing.locales.includes(locale)) {
		notFound();
	}

	const messages = await getMessages();
	return (
		<html lang={locale} suppressHydrationWarning>
			<head>
				<title>Online Store</title>
				<meta name='description' content='A simple online store' />
			</head>
			<body>
				<NextIntlClientProvider messages={messages}>
					<ChakraUIProvider>
						<ColorModeProvider>
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
						</ColorModeProvider>
					</ChakraUIProvider>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
