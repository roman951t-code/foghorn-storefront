import { ReactNode, Suspense } from 'react';
import { Box, Link } from '@chakra-ui/react';
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
import { CLIENT_MESSAGE_NAMESPACES } from '@/i18n/messages';
import { SessionProvider } from '@/providers/SessionProvider';
import { ColorModeProvider } from '@/components/ui/chakra/color-mode';
import { getCatalog } from '@/actions/products/getCatalog';
import { getCartItems } from '@/actions/cart/getCartItems';
import { fontVariableClassName } from '@/lib/fonts';
import { AppStoreHydrator } from '@/providers/AppStoreHydrator';
import { getHtmlLang, isAppLocale } from '@/constants/locales';
import type { AppLocale } from '@/constants/locales';
import type { Metadata } from 'next';
import { APP_URL, localizePath } from '@/utils/seo';
import CookieConsentBanner from '@/components/layout/CookieConsentBanner';
import { getEnabledStorefrontForms } from '@/actions/storefront/getEnabledStorefrontForms';
import { StorefrontFormPlacement } from '@prisma/client';
import { auth } from '@/lib/auth';

export const metadata: Metadata = {
	metadataBase: new URL(APP_URL),
	applicationName: 'Online Store',
	title: {
		default: 'Online Store | Electronics, Home Goods and Everyday Essentials',
		template: '%s | Online Store',
	},
	description:
		'Shop electronics, home goods, and everyday essentials online with secure checkout, fast delivery across Ukraine, warranty support, and fresh product deals.',
	keywords: [
		'online store',
		'product catalog',
		'electronics',
		'home goods',
		'Ukraine delivery',
		'secure checkout',
	],
	creator: 'Online Store',
	publisher: 'Online Store',
	category: 'ecommerce',
	referrer: 'origin-when-cross-origin',
	formatDetection: {
		telephone: false,
		address: false,
		email: false,
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-image-preview': 'large',
			'max-snippet': -1,
			'max-video-preview': -1,
		},
	},
	icons: {
		icon: [{ url: '/assets/images/logoSmall.webp', type: 'image/webp' }],
		apple: [{ url: '/assets/images/logoSmall.webp', type: 'image/webp' }],
	},
	openGraph: {
		siteName: 'Online Store',
		type: 'website',
		url: APP_URL,
		title: 'Online Store | Electronics, Home Goods and Everyday Essentials',
		description:
			'Shop electronics, home goods, and everyday essentials online with secure checkout, fast delivery across Ukraine, warranty support, and fresh product deals.',
		images: [
			{
				url: '/assets/images/logoBig.webp',
				width: 1200,
				height: 630,
				alt: 'Online Store',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Online Store | Electronics, Home Goods and Everyday Essentials',
		description:
			'Shop electronics, home goods, and everyday essentials online with secure checkout, fast delivery across Ukraine, warranty support, and fresh product deals.',
		images: ['/assets/images/logoBig.webp'],
	},
};

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

interface Props {
	children: ReactNode;
	params: { locale: string };
}

function LayoutFallback() {
	return <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }} />;
}

async function LayoutProviders({ children, locale }: { children: ReactNode; locale: AppLocale }) {
	const skipToMainLabel = locale === 'uk' ? 'Перейти до основного вмісту' : 'Skip to main content';
	const htmlLang = getHtmlLang(locale);
	const headersList = await headers();
	const cspNonce = headersList.get('x-csp-nonce') ?? undefined;

	const messagesPromise = loadClientMessages(CLIENT_MESSAGE_NAMESPACES);

	const session = await auth.api.getSession({
		headers: headersList,
		query: { disableCookieCache: true },
	});
	const userId = session?.user?.id ?? null;

	const catalogPromise = getCatalog(locale);
	const cookieBannerPromise = getEnabledStorefrontForms(StorefrontFormPlacement.COOKIE_BANNER);
	const cartPromise = userId ? getCartItems(userId) : Promise.resolve({ success: true, items: [] });

	const [messages, catalogResponse, cookieBanners, cartResponse] = await Promise.all([
		messagesPromise,
		catalogPromise,
		cookieBannerPromise,
		cartPromise,
	]);
	const cartItems = cartResponse.success ? cartResponse.items : [];

	const orgJsonLd = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'Organization',
				'@id': `${APP_URL}/#organization`,
				name: 'Online Store',
				url: APP_URL,
				logo: `${APP_URL}/assets/images/logoBig.webp`,
				sameAs: [] as string[],
			},
			{
				'@type': 'WebSite',
				'@id': `${APP_URL}/#website`,
				name: 'Online Store',
				url: APP_URL,
				publisher: { '@id': `${APP_URL}/#organization` },
				inLanguage: htmlLang,
				potentialAction: {
					'@type': 'SearchAction',
					target: `${APP_URL}${localizePath(locale, '/products/search')}?searchQuery={search_term_string}`,
					'query-input': 'required name=search_term_string',
				},
			},
		],
	};

	return (
		<ChakraUIProvider nonce={cspNonce}>
			<Box display='flex' flexDirection='column' minHeight='100vh' gap='6' bg='bg.primary'>
				<SessionProvider initialSession={session ?? null}>
					<NextIntlClientProvider messages={messages}>
						<AppStoreHydrator
							categories={catalogResponse.catalog}
							cartData={{ items: cartItems }}
							cartProductIds={{
								success: true,
								productIds: cartItems.map((item) => item.productId),
							}}
							wishListData={[]}
							wishListIds={{ success: true, productIds: [] }}
							isLoggedIn={Boolean(userId)}
						>
							<Script id='org-schema' nonce={cspNonce} type='application/ld+json'>
								{JSON.stringify(orgJsonLd)}
							</Script>
							<Link
								href='#main-content'
								position='fixed'
								top='2'
								left='2'
								zIndex='skipNav'
								bg='bg.secondary'
								color='fg'
								px='4'
								py='2'
								rounded='md'
								borderWidth='1px'
								borderColor='border'
								transform='translateY(-160%)'
								_focusVisible={{
									transform: 'translateY(0)',
									outline: '2px solid',
									outlineColor: 'main.secondary',
									outlineOffset: '2px',
								}}
							>
								{skipToMainLabel}
							</Link>
							<Header />
							<Box as='main' id='main-content' w='full' maxW='1444px' flex='1' mx='auto'>
								{children}
								<ToTop />
							</Box>
							<CookieConsentBanner form={cookieBanners?.[0] ?? null} />
						</AppStoreHydrator>
					</NextIntlClientProvider>
					<Footer />
				</SessionProvider>
			</Box>
		</ChakraUIProvider>
	);
}

export default async function Layout({ children, params }: Props) {
	const { locale } = await params;
	if (!isAppLocale(locale)) {
		notFound();
	}

	const htmlLang = getHtmlLang(locale);

	return (
		<html lang={htmlLang} suppressHydrationWarning>
			<body className={fontVariableClassName} suppressHydrationWarning>
				<ColorModeProvider>
					<Suspense fallback={<LayoutFallback />}>
						<LayoutProviders locale={locale}>{children}</LayoutProviders>
					</Suspense>
				</ColorModeProvider>
			</body>
		</html>
	);
}
