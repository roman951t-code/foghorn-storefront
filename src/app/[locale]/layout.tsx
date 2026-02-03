import { ReactNode, Suspense } from 'react';
import { Box } from '@chakra-ui/react';
import { hasLocale } from 'next-intl';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import Script from 'next/script';
import ChakraUIProvider from '@/providers/ChakraUIProvider';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import ToTop from '@/components/ui/buttons/ToTop';
import 'swiper/css';
import 'swiper/css/navigation';
import '@/styles/swiper.css';
import { routing } from '@/i18n/routing';
import { loadClientMessages } from '@/utils/i18nUtils';
import { auth } from '@/lib/auth';
import { SessionProvider } from '@/providers/SessionProvider';
import { ColorModeProvider } from '@/components/ui/chakra/color-mode';
import { getCartItems } from '@/actions/cart/getCartItems';
import { getCatalog } from '@/actions/products/getCatalog';
import { getWishListProducts } from '@/actions/wishlist/getWishListProducts';
import { montserrat, notoSans, openSans } from '@/lib/fonts';
import { AppStoreHydrator } from '@/providers/AppStoreHydrator';
import { LOCALE_TO_HTML_LANG, DEFAULT_LOCALE } from '@/constants/locales';
import { EMPTY_CART_DATA } from '@/constants/cart';
import type { AppLocale } from '@/constants/locales';
import type { Metadata } from 'next';
import { APP_URL } from '@/utils/seo';
import CookieConsentBanner from '@/components/layout/CookieConsentBanner';
import { getEnabledStorefrontForms } from '@/actions/storefront/getEnabledStorefrontForms';
import { StorefrontFormPlacement } from '@prisma/client';

export const metadata: Metadata = {
	metadataBase: new URL(APP_URL),
};

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

interface Props {
	children: ReactNode;
	params: { locale: AppLocale };
}

function LayoutFallback() {
	return <Box display='flex' flexDirection='column' minHeight='100vh' bg='bg.primary' />;
}

async function LayoutProviders({
	children,
}: {
	children: ReactNode;
}) {
	const headersList = await headers();

	const messagesPromise = loadClientMessages([
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

	const sessionPromise = auth.api.getSession({ headers: headersList });
	const catalogPromise = getCatalog();
	const cookieBannerPromise = getEnabledStorefrontForms(StorefrontFormPlacement.COOKIE_BANNER);

	const [messages, session, catalogResponse, cookieBanners] = await Promise.all([
		messagesPromise,
		sessionPromise,
		catalogPromise,
		cookieBannerPromise,
	]);

	const userId = session?.user?.id ?? null;

	const cartPromise = userId ? getCartItems(userId) : Promise.resolve({ success: true, items: [] });
	const wishListPromise = userId ? getWishListProducts(userId) : Promise.resolve({ products: [] });

	const [cartResponse, wishListData] = await Promise.all([cartPromise, wishListPromise]);

	const { success, ...restCartData } = cartResponse;
	const cartProductIds = success
		? { success: true, productIds: restCartData.items?.map((item) => item.productId) ?? [] }
		: { success: false, productIds: [] };
	const wishListIds = { success: true, productIds: wishListData?.products?.map((p) => p.id) ?? [] };

	const orgJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: 'Online Store',
		url: APP_URL,
		logo: `${APP_URL}/assets/images/logoBig.webp`,
		sameAs: [] as string[],
	};

	return (
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
					<Script id='org-schema' type='application/ld+json'>
						{JSON.stringify(orgJsonLd)}
					</Script>
					<Header />
					<Box as='main' w='full' maxW='1444px' flex='1' mx='auto'>
						{children}
						<ToTop />
					</Box>
					<CookieConsentBanner form={cookieBanners?.[0] ?? null} />
				</AppStoreHydrator>
			</NextIntlClientProvider>
			<Footer />
		</SessionProvider>
	);
}

export default async function Layout({ children, params }: Props) {
	const { locale } = await params;
	if (!hasLocale(routing.locales, locale)) {
		notFound();
	}

	const htmlLang = LOCALE_TO_HTML_LANG[locale] ?? LOCALE_TO_HTML_LANG[DEFAULT_LOCALE];

	return (
		<html lang={htmlLang} suppressHydrationWarning>
			<body className={`${openSans.variable} ${montserrat.variable} ${notoSans.variable}`}>
				<ColorModeProvider>
					<ChakraUIProvider>
						<Box display='flex' flexDirection='column' minHeight='100vh' gap='6' bg='bg.primary'>
							<Suspense fallback={<LayoutFallback />}>
								<LayoutProviders>{children}</LayoutProviders>
							</Suspense>
						</Box>
					</ChakraUIProvider>
				</ColorModeProvider>
			</body>
		</html>
	);
}
