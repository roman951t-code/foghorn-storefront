import Breadcrumbs from '@/components/ui/links/Breadcrumbs';
import { Flex, Heading } from '@chakra-ui/react';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { getProductBySlugCached } from '@/actions/products/getProductBySlug';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { cacheLife } from 'next/cache';
import {
	absoluteUrl,
	buildLanguageAlternates,
	localizePath,
	normalizeMetadataTitle,
} from '@/utils/seo';
import type { AppLocale } from '@/constants/locales';
import { ProductParams } from '@/types/routing';
import { ensureParams } from '@/utils/validateParams';
import {
	productParamsSchema,
	productSearchParamsSchema,
} from 'validationSchemas/productParamsSchemas';
import ProductTabs from '@/features/product/ProductTabs';
import { STORE_CURRENCY_CODE } from '@/config/currency';
import { resolveProductPrimaryImage } from '@/utils/productImages';
import ProductsSection, {
	DEFAULT_PRODUCTS_SECTION_LIMIT,
} from '@/features/catalog/ProductsSection';
import { getProductsBySubcategorySlug } from '@/actions/products/getProductsBySubcategorySlug';
import { isProductTabValue } from '@/constants/products';
import ProductPersonalization from '@/features/product/ProductPersonalization';
import { getProductStaticParams } from '@/actions/products/getCatalogStaticParams';
import JsonLd from '@/components/seo/JsonLd';
import { SITE_NAME } from '@/constants/site';

// Route intent: public product data stays cache-first; user review/view tracking is client no-store.
export const generateStaticParams = getProductStaticParams;

type Props = ProductParams & { searchParams: { tab?: string; image?: string } };

// Two-layer generateMetadata: the outer body reads runtime data (`searchParams`)
// and passes only the discrete values the cached inner helper needs. Awaiting
// `searchParams` inside a `'use cache'` scope is a hard error under Cache
// Components; extracting the value first sidesteps that while still caching
// the assembled Metadata object per (slug, locale, tab).
export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const {
		product: productSlug,
		category,
		subcategory,
		locale,
	} = ensureParams(productParamsSchema, await params);

	return buildProductMetadata({
		productSlug,
		category,
		subcategory,
		locale,
	});
}

async function buildProductMetadata({
	productSlug,
	category,
	subcategory,
	locale,
}: {
	productSlug: string;
	category: string;
	subcategory: string;
	locale: string;
}): Promise<Metadata> {
	'use cache';
	cacheLife('hours');

	const productData = await getProductBySlugCached(productSlug, locale);
	if (!productData) notFound();

	const toAbsolute = (url?: string | null) => {
		if (!url) return undefined;
		return url.startsWith('http') ? url : absoluteUrl(url);
	};

	const pagesT = await getTranslations({ locale, namespace: 'pages' });
	const defaultTitle = pagesT('metadata.product', { product: productData.name });
	const defaultDescription = pagesT('metadata.productDescription', {
		product: productData.name,
		description: productData.description ?? '',
	});
	const title = normalizeMetadataTitle(productData.metaTitle ?? defaultTitle);
	const description = productData.metaDescription ?? defaultDescription;
	// Tab selection is client-side UI state, not distinct content — the
	// canonical/hreflang set must always point at the bare product URL so
	// ?tab=feedback / ?tab=characteristics consolidate into the one indexable
	// page instead of Google treating them as separate (h1-less) URLs.
	const alternates = buildLanguageAlternates(
		locale as AppLocale,
		`/products/${category}/${subcategory}/${productSlug}`,
	);
	const canonical = toAbsolute(productData.canonicalUrl) ?? alternates?.canonical;
	// Only pin an explicit share image when the admin configured one. Otherwise
	// leave `images` unset so Next.js's file-based opengraph-image.tsx (which
	// renders title + price + brand from the same product data) generates the
	// share card instead — setting `images` here unconditionally would shadow
	// that generator and Next would never call it.
	const customOgImage = toAbsolute(productData.openGraphImage);

	return {
		title,
		description,
		alternates: {
			...alternates,
			canonical,
		},
		openGraph: {
			title,
			description,
			type: 'website',
			url: canonical,
			...(customOgImage ? { images: [customOgImage] } : {}),
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			...(customOgImage ? { images: [customOgImage] } : {}),
		},
	};
}

export default async function ProductDetail({ params, searchParams }: Props) {
	const { category, subcategory, product, locale } = ensureParams(
		productParamsSchema,
		await params,
	);
	const { tab, image } = ensureParams(productSearchParamsSchema, await searchParams);
	const selectedTab = tab && isProductTabValue(tab) ? tab : 'about';
	const parsedImageIndex = image ? Number(image) - 1 : 0;
	const initialImageIndex =
		Number.isFinite(parsedImageIndex) && parsedImageIndex >= 0 ? Math.floor(parsedImageIndex) : 0;

	const headersList = await headers();
	const cspNonce = headersList.get('x-csp-nonce') ?? undefined;
	const [productData, productsT, pagesT, subcategoryProductsData] = await Promise.all([
		getProductBySlugCached(product, locale),
		getTranslations({ locale, namespace: 'products' }),
		getTranslations({ locale, namespace: 'pages' }),
		getProductsBySubcategorySlug(
			subcategory,
			DEFAULT_PRODUCTS_SECTION_LIMIT + 1,
			0,
			undefined,
			undefined,
			undefined,
			undefined,
			undefined,
			undefined,
			locale,
		),
	]);
	const homeLabel = pagesT('main.title');

	if (!productData) notFound();

	const sameSubcategoryProducts = (subcategoryProductsData?.products ?? [])
		.filter((sameSubcategoryProduct) => sameSubcategoryProduct.id !== productData.id)
		.slice(0, DEFAULT_PRODUCTS_SECTION_LIMIT);

	const canonicalPath = localizePath(locale, `/products/${category}/${subcategory}/${product}`);
	const toAbsolute = (url?: string | null) => {
		if (!url) return undefined;
		return url.startsWith('http') ? url : absoluteUrl(url);
	};
	const canonicalUrl = toAbsolute(productData.canonicalUrl) ?? absoluteUrl(canonicalPath);

	const images = (productData.images ?? [])
		.map((src) => toAbsolute(src))
		.filter(Boolean) as string[];
	const openGraphImage = toAbsolute(productData.openGraphImage);
	const primaryImage =
		images[0] ?? openGraphImage ?? toAbsolute(resolveProductPrimaryImage(productData.imageUrl));
	const defaultVariant =
		productData.variants?.find((variant) => (variant.stock ?? 0) > 0) ??
		productData.variants?.[0] ??
		null;
	const price =
		defaultVariant?.discountPrice ??
		defaultVariant?.price ??
		productData.discountPrice ??
		productData.basePrice;
	const availability = productData.inStock
		? 'https://schema.org/InStock'
		: 'https://schema.org/OutOfStock';

	const reviewsJsonLd = (productData.reviews ?? [])
		.reduce<Record<string, unknown>[]>((acc, review) => {
			if (acc.length >= 3) return acc;
			const reviewBody =
				review.comment || [review.advantages, review.disadvantages].filter(Boolean).join('. ');
			if (!reviewBody) return acc;
			acc.push({
				'@type': 'Review',
				reviewBody,
				datePublished: review.createdAt?.toISOString?.() ?? undefined,
				author: {
					'@type': 'Person',
					name:
						[review.user?.name, review.user?.lastName].filter(Boolean).join(' ').trim() ||
						'Customer',
				},
				reviewRating: {
					'@type': 'Rating',
					ratingValue: review.rating,
					bestRating: 5,
					worstRating: 1,
				},
			});
			return acc;
		}, []);

	const breadcrumbsJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				name: homeLabel,
				item: absoluteUrl(localizePath(locale, '/')),
			},
			{
				'@type': 'ListItem',
				position: 2,
				name: productData.categoryName,
				item: absoluteUrl(localizePath(locale, `/products/${category}`)),
			},
			{
				'@type': 'ListItem',
				position: 3,
				name: productData.subcategoryName,
				item: absoluteUrl(localizePath(locale, `/products/${category}/${subcategory}`)),
			},
			{
				'@type': 'ListItem',
				position: 4,
				name: productData.name,
				item: canonicalUrl,
			},
		],
	};

	const productJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'Product',
		name: productData.name,
		...(productData.metaTitle
			? { alternateName: normalizeMetadataTitle(productData.metaTitle) }
			: {}),
		description: productData.metaDescription ?? productData.description ?? productData.name,
		url: canonicalUrl,
		image: [
			...(openGraphImage ? [openGraphImage] : []),
			...(images.length ? images : primaryImage ? [primaryImage] : []),
		].filter((value, index, arr) => !!value && arr.indexOf(value) === index),
		sku: productData.productCode,
		brand: {
			'@type': 'Brand',
			name: productData.brand?.name ?? SITE_NAME,
		},
		offers: {
			'@type': 'Offer',
			url: canonicalUrl,
			price: price ?? undefined,
			priceCurrency: STORE_CURRENCY_CODE,
			availability,
			itemCondition: 'https://schema.org/NewCondition',
		},
		...(productData.reviewCount > 0 && {
			aggregateRating: {
				'@type': 'AggregateRating',
				ratingValue: productData.averageRating,
				reviewCount: productData.reviewCount,
			},
		}),
		...(reviewsJsonLd.length > 0 && { review: reviewsJsonLd }),
	};

	return (
		<>
			<JsonLd id='product-schema' nonce={cspNonce} data={productJsonLd} />
			<JsonLd id='breadcrumbs-schema' nonce={cspNonce} data={breadcrumbsJsonLd} />
			<ProductPersonalization productId={productData.id} reviews={productData.reviews} />

			<Flex
				mx={{ base: '18px', '2xl': 0 }}
				gap={4}
				direction='column'
				css={{
					// Smooths the handoff from loading.tsx's ProductDetailPageSkeleton
					// to this real content — without it, the Suspense-boundary swap is
					// an instant hard cut (shimmering gray blocks -> full content in one
					// frame), which reads as a jarring flash/glitch even though the
					// skeleton's dimensions already prevent any layout shift.
					animation: 'productDetailFadeIn 0.35s ease-out',
					'@keyframes productDetailFadeIn': {
						from: { opacity: 0 },
						to: { opacity: 1 },
					},
				}}
			>
				{/* AboutTab's visible product-name heading only mounts for the
				    'about' tab (see ProductTabs), so a direct ?tab=feedback or
				    ?tab=characteristics link would otherwise render zero <h1>.
				    This renders unconditionally so every tab variant keeps
				    exactly one h1. */}
				<Heading as='h1' srOnly>
					{productData.name}
				</Heading>
				<Breadcrumbs
					categorySlug={category}
					subcategorySlug={subcategory}
					categoryName={productData?.categoryName}
					subcategoryName={productData?.subcategoryName}
					productSlug={productData?.slug}
					productName={productData?.name}
				/>

				<ProductTabs
					tab={tab}
					product={productData}
					category={category}
					subcategory={subcategory}
					initialImageIndex={initialImageIndex}
				/>

				{selectedTab === 'about' && (
					<ProductsSection
						title={productsT('sameSubcategory')}
						tag='similar'
						href={`/products/${category}/${subcategory}`}
						products={sameSubcategoryProducts}
						limit={DEFAULT_PRODUCTS_SECTION_LIMIT}
						locale={locale}
					/>
				)}
			</Flex>
		</>
	);
}
