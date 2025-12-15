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
import { CartData } from '@/types/cart';
import { getWishListProducts } from '@/actions/wishlist/getWishListProducts';
import { getWishListProductIds } from '@/actions/wishlist/getWishListProductIds';
import { montserrat, notoSans, openSans } from '@/lib/fonts';
import { AppStoreHydrator } from '@/providers/AppStoreHydrator';

interface Props {
	children: ReactNode;
	params: { locale: 'ua' | 'us' };
}

const toHtmlLang = (locale: 'ua' | 'us') => (locale === 'ua' ? 'uk' : 'en-US');

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

	const emptyCartData: CartData = { items: [] };
	const { success, ...restCartData } = cartResponse;

	const htmlLang = toHtmlLang(locale);

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
										cartData={success ? restCartData : emptyCartData}
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
