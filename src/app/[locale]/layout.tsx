import { ReactNode } from 'react';
import { Box, Link } from '@chakra-ui/react';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import ChakraUIProvider from '@/providers/ChakraUIProvider';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import ToTop from '@/components/ui/buttons/ToTop';
import NavigationProgressBar from '@/components/ui/nav/NavigationProgressBar';
import 'swiper/css';
import 'swiper/css/navigation';
import '@/styles/swiper.css';
import { routing } from '@/i18n/routing';
import { loadClientMessages } from '@/utils/i18nServerUtils';
import { CLIENT_MESSAGE_NAMESPACES } from '@/i18n/messages';
import { SessionProvider } from '@/providers/SessionProvider';
import { ColorModeProvider } from '@/components/ui/chakra/color-mode';
import { THEME_STORAGE_KEY } from '@/constants/theme';
import { getCatalog } from '@/actions/products/getCatalog';
import { fontVariableClassName } from '@/lib/fonts';
import { AppStoreHydrator } from '@/providers/AppStoreHydrator';
import { getHtmlLang, isAppLocale, LOCALE_TO_HTML_LANG, LOCALE_TO_INTL_MAP } from '@/constants/locales';
import type { AppLocale } from '@/constants/locales';
import type { Metadata, Viewport } from 'next';
import { APP_URL, absoluteUrl, localizePath } from '@/utils/seo';
import CookieConsentBanner from '@/components/layout/CookieConsentBanner';
import { getEnabledStorefrontForms } from '@/actions/storefront/getEnabledStorefrontForms';
import { StorefrontFormPlacement } from '@prisma/client';
import { getCspNonce } from '@/lib/cspNonce';
import type { CatalogCategory } from '@/types/product';

// Root metadata for the locale segment. Next.js forbids exporting both
// `metadata` and `generateMetadata` from the same file, so this is the
// single source of truth.
//
// Deliberately NOT annotated with `'use cache'`:
//   - `metadataBase` returns a real `URL` instance. Cache scopes serialize
//     their return value as JSON, and URL is not JSON-serialisable — Next.js
//     surfaces that as the "URL objects are not supported" error we hit
//     when we did try to cache it.
//   - The assembly here does no DB or fetch work — just locale routing math
//     and string concatenation. Caching it would save microseconds and
//     forbid the URL we need, so we don't.
//
// Individual page-level `generateMetadata` calls (product/category/etc.)
// still keep their own `'use cache'` for the parts that DO hit the DB.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { locale } = await params;
	const resolvedLocale = isAppLocale(locale) ? locale : ('uk' as const);
	const canonical = absoluteUrl(localizePath(resolvedLocale, '/'));
	const languages: Record<string, string> = Object.fromEntries(
		routing.locales.map((code) => [
			LOCALE_TO_HTML_LANG[code as AppLocale] ?? code,
			absoluteUrl(localizePath(code as AppLocale, '/')),
		]),
	);
	languages['x-default'] = absoluteUrl(localizePath(routing.defaultLocale as AppLocale, '/'));

	const currentOgLocale = (LOCALE_TO_INTL_MAP[resolvedLocale] ?? 'uk_UA').replace('-', '_');
	const alternateOgLocales = routing.locales
		.filter((code) => code !== resolvedLocale)
		.map((code) => (LOCALE_TO_INTL_MAP[code as AppLocale] ?? code).replace('-', '_'));

	return {
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
		alternates: { canonical, languages },
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
			icon: [
				{ url: '/favicon.svg', type: 'image/svg+xml' },
				{ url: '/assets/images/logoSmall.webp', type: 'image/webp' },
			],
			apple: [{ url: '/assets/images/logoSmall.webp', type: 'image/webp' }],
		},
		openGraph: {
			siteName: 'Online Store',
			type: 'website',
			url: canonical,
			locale: currentOgLocale,
			alternateLocale: alternateOgLocales,
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
}

// Emits the <meta name="viewport"> + theme-color tags. Split from `metadata`
// per Next.js 14+ convention. `themeColor` matches the manifest background so
// Android Chrome / Safari address bars blend with the app on mobile.
export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	themeColor: [
		{ media: '(prefers-color-scheme: light)', color: '#ffffff' },
		{ media: '(prefers-color-scheme: dark)', color: '#0a0f1f' },
	],
	colorScheme: 'light dark',
};

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

interface Props {
	children: ReactNode;
	params: { locale: string };
}

// The visible shell — Header + main + footer + cookie banner. Rendered
// identically for both the guest (Suspense fallback) and authenticated
// (streamed) branches so users don't see the layout jump when session
// data resolves; only the SessionProvider + AppStoreHydrator wrapping it
// carry different `initialSession` / `cartItems` values.
async function VisibleShell({
	children,
	skipToMainLabel,
	cspNonce,
	orgJsonLd,
	cookieBanner,
	locale,
}: {
	children: ReactNode;
	skipToMainLabel: string;
	cspNonce: string | undefined;
	orgJsonLd: unknown;
	cookieBanner: Parameters<typeof CookieConsentBanner>[0]['form'];
	locale: AppLocale;
}) {
	return (
		<>
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
			<Header locale={locale} />
			<Box as='main' id='main-content' w='full' maxW='1444px' flex='1' mx='auto'>
				{children}
				<ToTop />
			</Box>
			<CookieConsentBanner form={cookieBanner} />
		</>
	);
}

// Under Cache Components, doing the session lookup here (which needs
// `headers()`) would opt the whole layout out of prerendering and, because
// pages within `children` also access runtime data, would compound into
// blocking-route warnings. Instead, we render SessionProvider with a null
// initial session; its existing client-side polling (see SessionProvider —
// window focus, visibilitychange, and a 15s interval) picks up the real
// session shortly after hydration. AppStoreHydrator's fallback path
// already handles the guest state (client fetches /api/cart when session
// resolves), so authenticated users see at most a beat of guest chrome on
// hard navigations — never on client-side transitions.
function GuestShell({
	children,
	catalog,
	cspNonce,
	orgJsonLd,
	skipToMainLabel,
	cookieBanner,
	locale,
}: {
	children: ReactNode;
	catalog: CatalogCategory[];
	cspNonce: string | undefined;
	orgJsonLd: unknown;
	skipToMainLabel: string;
	cookieBanner: Parameters<typeof CookieConsentBanner>[0]['form'];
	locale: AppLocale;
}) {
	return (
		<SessionProvider initialSession={null}>
			<AppStoreHydrator
				categories={catalog}
				cartData={{ items: [] }}
				cartProductIds={{ success: true, productIds: [] }}
				wishListData={[]}
				wishListIds={{ success: true, productIds: [] }}
				isLoggedIn={false}
			>
				<VisibleShell
					skipToMainLabel={skipToMainLabel}
					cspNonce={cspNonce}
					orgJsonLd={orgJsonLd}
					cookieBanner={cookieBanner}
					locale={locale}
				>
					{children}
				</VisibleShell>
			</AppStoreHydrator>
		</SessionProvider>
	);
}

// The outer shell only awaits cached data (i18n messages + catalog + storefront
// forms are all `use cache`). None of these opt the route out of prerendering
// — the shell can be served as a static HTML skeleton and the per-user island
// streams in through a Suspense boundary on top of it.
async function PrerenderedShell({ children, locale }: { children: ReactNode; locale: AppLocale }) {
	const skipToMainLabel = locale === 'uk' ? 'Перейти до основного вмісту' : 'Skip to main content';
	const htmlLang = getHtmlLang(locale);
	const cspNonce = getCspNonce();

	const [messages, catalogResponse, cookieBanners] = await Promise.all([
		loadClientMessages(locale, CLIENT_MESSAGE_NAMESPACES),
		getCatalog(locale),
		getEnabledStorefrontForms(StorefrontFormPlacement.COOKIE_BANNER),
	]);

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

	const cookieBanner = cookieBanners?.[0] ?? null;
	const shellProps = {
		catalog: catalogResponse.catalog,
		cspNonce,
		orgJsonLd,
		skipToMainLabel,
		cookieBanner,
		locale,
	};

	return (
		<ChakraUIProvider nonce={cspNonce}>
			<NavigationProgressBar />
			<Box display='flex' flexDirection='column' minHeight='100vh' gap='6' bg='bg.primary'>
				<NextIntlClientProvider locale={locale} messages={messages}>
					<GuestShell {...shellProps}>{children}</GuestShell>
				</NextIntlClientProvider>
				<Footer locale={locale} />
			</Box>
		</ChakraUIProvider>
	);
}

export default async function Layout({ children, params }: Props) {
	const { locale } = await params;
	if (!isAppLocale(locale)) {
		notFound();
	}
	// Populates next-intl's request-scoped locale cache so any implicit
	// (locale-less) call to its server APIs further down the tree — including
	// NextIntlClientProvider's own auto-inherited `locale`/`now`/`timeZone`/
	// `formats` — resolves from this cache instead of falling back to
	// `headers()`, which would opt the route out of prerendering.
	setRequestLocale(locale);

	const htmlLang = getHtmlLang(locale);
	const cspNonce = getCspNonce();

	return (
		<html lang={htmlLang} suppressHydrationWarning>
			<body className={fontVariableClassName} suppressHydrationWarning>
				{/* Sets the light/dark class on <html> before the body paints, so the
				    page never flashes the wrong theme on reload. A plain <script> (not
				    next/script) so the browser's HTML parser runs it inline, in
				    document order, instead of waiting for React/hydration — which is
				    what ColorModeProvider's effect does, too late to avoid the flash. */}
				<script
					nonce={cspNonce}
					suppressHydrationWarning
					dangerouslySetInnerHTML={{
						__html: `(function(){try{var m=localStorage.getItem('${THEME_STORAGE_KEY}');if(m!=='light'&&m!=='dark'){m=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.classList.add(m);document.documentElement.style.colorScheme=m;}catch(e){}})();`,
					}}
				/>
				<ColorModeProvider>
					<PrerenderedShell locale={locale}>{children}</PrerenderedShell>
				</ColorModeProvider>
			</body>
		</html>
	);
}
