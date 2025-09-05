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
import { CatalogProvider } from '@/components/providers/CatalogProvider';
import { CartProvider } from '@/components/providers/CartProvider';
import { getCartItems } from '@/actions/cart/getCartItems';
import { getCartProductIds } from '@/actions/cart/getCartProductIds';
import { getCatalog } from '@/actions/products/getCatalog';
import { CartData } from '@/types/cart';
import { getWishListProducts } from '@/actions/wishlist/getWishListProducts';
import { getWishListProductIds } from '@/actions/wishlist/getWishListProductIds';
import { WishListProvider } from '@/components/providers/WishListProvider';

interface Props {
	children: ReactNode;
	params: { locale: 'ua' | 'ru' };
}

export default async function Layout({ children, params }: Props) {
	const { locale } = await params;
	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}

	const messages = await loadClientMessages([
		'General',
		'Auth',
		'Products',
		'Cart',
		'Sidebar',
		'Wishlist',
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

	return (
		<html lang={locale} suppressHydrationWarning>
			<body>
				<ColorModeProvider>
					<ChakraUIProvider>
						<Box display='flex' flexDirection='column' minHeight='100vh' gap='6' bg='bg.primary'>
							<SessionProvider initialSession={session}>
								<NextIntlClientProvider messages={messages}>
									<CatalogProvider categories={catalogResponse.catalog}>
										<CartProvider
											cartData={success ? restCartData : emptyCartData}
											cartProductIds={cartProductIds}
										>
											<WishListProvider
												wishListData={wishListData?.products ?? []}
												wishListIds={wishListIds}
											>
												<Header />
												<Box as='main' w='full' maxW='1444px' flex='1' mx='auto'>
													{children}
													<ToTop />
												</Box>
											</WishListProvider>
										</CartProvider>
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
