import { ReactNode } from 'react';
import ChakraUIProvider from '@/providers/ChakraUIProvider';
import { Box } from '@chakra-ui/react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { hasLocale } from 'next-intl';
import ToTop from '@/components/ui/buttons/ToTop';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { loadClientMessages } from '@/utils/i18nUtils';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { SessionProvider } from '@/providers/SessionProvider';
import { ColorModeProvider } from '@/components/ui/chakra/color-mode';
import { getCartItems } from '@/actions/cart/getCartItems';
import { getCartProductIds } from '@/actions/cart/getCartProductIds';
import { getCatalog } from '@/actions/products/getCatalog';
import { getWishListProducts } from '@/actions/wishlist/getWishListProducts';
import { getWishListProductIds } from '@/actions/wishlist/getWishListProductIds';
import { montserrat, notoSans, openSans } from '@/lib/fonts';
import { AppStoreHydrator } from '@/providers/AppStoreHydrator';
import { LOCALE_TO_HTML_LANG, DEFAULT_LOCALE } from '@/constants/locales';
import { EMPTY_CART_DATA } from '@/constants/cart';
import type { AppLocale } from '@/constants/locales';
import type { Metadata } from 'next';
import { APP_URL } from '@/utils/seo';

export const metadata: Metadata = {
	metadataBase: new URL(APP_URL),
};

interface Props {
	children: ReactNode;
	params: { locale: AppLocale };
}

export default async function Layout({ children, params }: Props) {
	const { locale } = await params;
	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}

	const messages = await loadClientMessages([
		'common',
		'auth',
		'validation',
		'products',
		'cart',
		'navigation',
		'wishlist',
		'pages',
		'errors',
		'checkout',
		'orders',
		'pagination',
	]);

	const session = await auth.api.getSession({ headers: await headers() });
	const userId = session?.user?.id ?? null;

	const catalogResponse = await getCatalog();

	const cartResponse = userId ? await getCartItems(userId) : { success: true, items: [] };
	const cartProductIds = userId
		? await getCartProductIds(userId)
		: { success: false, productIds: [] };

	const wishListData = userId ? await getWishListProducts(userId) : { products: [] };
	const wishListIds = userId
		? await getWishListProductIds(userId)
		: { success: false, productIds: [] };

	const { success, ...restCartData } = cartResponse;

	const htmlLang = LOCALE_TO_HTML_LANG[locale] ?? LOCALE_TO_HTML_LANG[DEFAULT_LOCALE];

	return (
		<html lang={htmlLang} suppressHydrationWarning>
			<body className={`${openSans.variable} ${montserrat.variable} ${notoSans.variable}`}>
				<ColorModeProvider>
					<ChakraUIProvider>
						<Box display='flex' flexDirection='column' minHeight='100vh' gap='6' bg='bg.primary'>
							<SessionProvider initialSession={session}>
								<NextIntlClientProvider messages={messages}>
									<AppStoreHydrator
										categories={catalogResponse.catalog}
										cartData={success ? restCartData : EMPTY_CART_DATA}
										cartProductIds={cartProductIds}
										wishListData={wishListData?.products ?? []}
										wishListIds={wishListIds}
										isLoggedIn={!!userId}
									>
										<Header />
										<Box as='main' w='full' maxW='1444px' flex='1' mx='auto'>
											{children}
											<ToTop />
										</Box>
									</AppStoreHydrator>
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
