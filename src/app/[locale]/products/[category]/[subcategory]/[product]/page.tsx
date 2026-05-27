import Breadcrumbs from '@/components/ui/links/Breadcrumbs';
import { Flex } from '@chakra-ui/react';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { getProductBySlugCached } from '@/actions/products/getProductBySlug';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { absoluteUrl, buildLanguageAlternates, localizePath } from '@/utils/seo';
import Script from 'next/script';
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

// Route intent: public product data stays cache-first; user review/view tracking is client no-store.
export const generateStaticParams = getProductStaticParams;

type Props = ProductParams & { searchParams: { tab?: string; image?: string } };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
	const {
		product: productSlug,
		category,
		subcategory,
		locale,
	} = ensureParams(productParamsSchema, await params);
	const resolvedSearch = ensureParams(productSearchParamsSchema, await searchParams);

	const productData = await getProductBySlugCached(productSlug, locale);
	if (!productData) notFound();

	const toAbsolute = (url?: string | null) => {
		if (!url) return undefined;
		return url.startsWith('http') ? url : absoluteUrl(url);
	};

	const pagesT = await getTranslations('pages');
	const defaultTitle = pagesT('metadata.product', { product: productData.name });
	const defaultDescription = pagesT('metadata.productDescription', {
		product: productData.name,
		description: productData.description ?? '',
	});
	const title = productData.metaTitle ?? defaultTitle;
	const description = productData.metaDescription ?? defaultDescription;
	const alternates = buildLanguageAlternates(
		locale,
		`/products/${category}/${subcategory}/${productSlug}`,
		{
			...(resolvedSearch?.tab ? { tab: resolvedSearch.tab } : {}),
		},
	);
	const canonical = toAbsolute(productData.canonicalUrl) ?? alternates?.canonical;
	const image = absoluteUrl(resolveProductPrimaryImage(productData.imageUrl));
	const ogImage = toAbsolute(productData.openGraphImage) ?? image;

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
			images: [ogImage],
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			images: [ogImage],
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
		getTranslations('products'),
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

	const reviewsJsonLd =
		productData.reviews && productData.reviews.length > 0
			? productData.reviews.slice(0, 3).map((review) => ({
					'@type': 'Review',
					reviewBody:
						review.comment ??
						[review.advantages, review.disadvantages].filter(Boolean).join('. ') ??
						'',
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
				}))
			: [];

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
		...(productData.metaTitle ? { alternateName: productData.metaTitle } : {}),
		description: productData.metaDescription ?? productData.description ?? productData.name,
		url: canonicalUrl,
		image: [
			...(openGraphImage ? [openGraphImage] : []),
			...(images.length ? images : primaryImage ? [primaryImage] : []),
		].filter((value, index, arr) => !!value && arr.indexOf(value) === index),
		sku: productData.productCode,
		brand: {
			'@type': 'Brand',
			name: productData.brand?.name ?? 'Online Store',
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
			<Script id='product-schema' nonce={cspNonce} type='application/ld+json'>
				{JSON.stringify(productJsonLd)}
			</Script>
			<Script id='breadcrumbs-schema' nonce={cspNonce} type='application/ld+json'>
				{JSON.stringify(breadcrumbsJsonLd)}
			</Script>
			<ProductPersonalization productId={productData.id} reviews={productData.reviews} />

			<Flex mx={{ base: '12px', '2xl': 0 }} gap={4} direction='column'>
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
