import { Suspense } from 'react';
import { Flex, Box, Heading } from '@chakra-ui/react';
import CatalogPanel from '@/features/catalog/CatalogPanel';
import ProductsSection from '@/features/catalog/ProductsSection';
import SubscribeSection from '@/components/ui/sections/SubscribeSectionLazy';
import CatalogBtn from '@/components/ui/buttons/CatalogBtn';
import { extractI18nData } from '@/utils/i18nUtils';
import { getLocalizedMetadata } from '@/utils/i18nServerUtils';
import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import {
	SUBSCRIBE_AUTH_KEYS,
	SUBSCRIBE_COMMON_KEYS,
	SUBSCRIBE_VALIDATION_KEYS,
} from '@/constants/subscribe';
import { LocaleParams } from '@/types/routing';
import { getPromoCards } from '@/actions/content/getPromoCards';
import ViewedProductsSection from '@/features/catalog/ViewedProductsSection';

// Route intent: public cache-first storefront; keep per-user data in client/no-store islands.
export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
	const { locale } = await params;
	const { openGraph, twitter, ...metadata } = await getLocalizedMetadata(locale, 'main', {
		pathname: '/',
	});
	// Drop the static logo fallback image here so Next.js's file-based
	// opengraph-image.tsx (generated per-locale title + description card)
	// resolves instead — an explicit `images` entry would shadow it.
	const { images: _ogImages, ...openGraphRest } = openGraph ?? {};
	const { images: _twitterImages, ...twitterRest } = twitter ?? {};
	return { ...metadata, openGraph: openGraphRest, twitter: twitterRest };
}

export default async function Main({ params }: LocaleParams) {
	const { locale } = await params;
	const [genT, prodT, authT, validT, pagesT, promoCards] = await Promise.all([
		getTranslations({ locale, namespace: 'common' }),
		getTranslations({ locale, namespace: 'products' }),
		getTranslations({ locale, namespace: 'auth' }),
		getTranslations({ locale, namespace: 'validation' }),
		getTranslations({ locale, namespace: 'pages' }),
		getPromoCards('promo', locale),
	]);

	const i18nData = extractI18nData(genT, ['seeCategory', 'seeAll']);

	const subscribeI18nData = {
		...extractI18nData(genT, [...SUBSCRIBE_COMMON_KEYS]),
		...extractI18nData(authT, [...SUBSCRIBE_AUTH_KEYS]),
		...extractI18nData(validT, [...SUBSCRIBE_VALIDATION_KEYS]),
	};

	return (
		<Flex mx={{ base: '18px', '2xl': 0 }} direction='column'>
			{/* Every section heading on this page is an h2 (ProductsSection's
			    Heading has no `as` override, so Chakra's default applies) — the
			    page had zero h1 anywhere. */}
			<Heading as='h1' srOnly>
				{pagesT('metadata.main.title')}
			</Heading>
			<Box hideFrom='sm' mb='24px'>
				<CatalogBtn fullText />
			</Box>
			<CatalogPanel i18nData={i18nData} promoCards={promoCards} />
			{/* Popular products is the first slider below the fold-adjacent promo
			    panel, so it mounts eagerly like before. Everything past it gets
			    lazyMount: the homepage stacks up to 6 Swiper instances, and
			    mounting them all at once was PageSpeed Insights' "forced reflow"
			    diagnostic — each one measures/writes slide widths in the same
			    burst. Deferring the ones that are actually off-screen on load
			    spreads that work out instead of front-loading all of it. */}
			<ProductsSection title={prodT('popular')} tag='popular' locale={locale} />
			<ProductsSection title={prodT('new')} tag='new' lazyMount />
			<ProductsSection title={prodT('discount')} tag='discount' lazyMount />
			<ProductsSection title={prodT('promotional')} tag='promotional' lazyMount />
			{/* Own Suspense boundary: this section reads the session (uncached,
			    per-request) while every ProductsSection above is `'use cache'`.
			    Without a local boundary here, that one dynamic read bubbles up to
			    the root layout's <Suspense fallback={null}> and blanks the whole
			    page on every homepage visit until it resolves — not just this
			    section. */}
			<Suspense fallback={null}>
				<ViewedProductsSection title={prodT('viewed')} tag='viewed' lazyMount />
			</Suspense>

			{/* Lazy (SubscribeSectionLazy, not the plain component): this was the
			    only *statically*-imported consumer of react-hook-form/zod on this
			    route. Auth's own dynamic import (DynamicAuth.tsx) wasn't enough on
			    its own — as long as something eager on the page still needed
			    zod/react-hook-form, the bundler kept grouping every module using
			    them, Auth's schemas included, into one chunk that loaded eagerly
			    regardless. Removing the last eager consumer let that shared chunk
			    go fully lazy too (confirmed via build output + a local production
			    server's network log). */}
			<SubscribeSection i18nData={subscribeI18nData} />
		</Flex>
	);
}
