import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Breadcrumbs from '@/components/ui/links/Breadcrumbs';
import ProductsGrid from '../../_components/ProductsGrid';
import { Flex, Heading, Box, Group, VStack, Text, Separator, HStack } from '@chakra-ui/react';
import CatalogBtn from '@/components/ui/buttons/CatalogBtn';
import QuickFilters from '../../_components/QuickFilters';
import Filters from '../../_components/Filters';
import FiltersSidebar from '../../_components/FiltersSidebar';
import FiltersTags from '../../_components/FiltersTags';
import { getProductsBySubcategorySlug } from '@/actions/products/getProductsBySubcategorySlug';
import { Metadata } from 'next';
import Pagination from '@/components/ui/Pagination';
import { getSubcategoryNameBySlug } from '@/actions/products/getSubcategoryNameBySlug';
import { getSubcategoryFilters } from '@/actions/products/getProductsFilters';
import ViewedProductsSection from '@/features/catalog/ViewedProductsSection';
import {
	PRODUCTS_PER_PAGE,
	resolveOffset,
	resolvePageParam,
	resolvePerPageParam,
} from '@/constants/pagination';
import { SUBCATEGORY_FILTER_EXCLUDED_KEYS } from '@/constants/products';
import { absoluteUrl, buildLanguageAlternates, localizePath } from '@/utils/seo';
import type { AppLocale } from '@/constants/locales';
import Script from 'next/script';
import { ProductFiltersSearchParams, SubcategoryParams } from '@/types/routing';
import { ensureParams } from '@/utils/validateParams';
import { subcategoryParamsSchema } from 'validationSchemas/productParamsSchemas';
import CountPill from '@/components/ui/CountPill';
import { headers } from 'next/headers';
import { cacheLife } from 'next/cache';
import { getSubcategoryStaticParams } from '@/actions/products/getCatalogStaticParams';

// Route intent: SSR per filter params; product and filter data stay cached in tagged actions.
export const generateStaticParams = getSubcategoryStaticParams;

type Props = SubcategoryParams & {
	searchParams: ProductFiltersSearchParams;
};

// Two-layer generateMetadata: the outer body reads runtime `searchParams`
// (illegal inside a 'use cache' scope) and forwards only the two derived
// values the cached inner helper needs — whether any indexable filter is set
// and the current page number. The inner helper caches per (slug, locale,
// canonicalPage, hasFilteringParams).
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
	const { category, subcategory, locale } = ensureParams(subcategoryParamsSchema, await params);
	const resolvedSearch = await searchParams;

	const hasFilteringParams = Object.entries(resolvedSearch ?? {}).some(([key, value]) => {
		if (key === 'page' || key === 'perPage') return false;
		if (Array.isArray(value)) return value.some(Boolean);
		return Boolean(value);
	});
	const parsedPage = Number.parseInt(
		Array.isArray(resolvedSearch?.page) ? resolvedSearch.page[0] : (resolvedSearch?.page ?? '1'),
		10,
	);
	const canonicalPage = Number.isFinite(parsedPage) && parsedPage > 1 ? parsedPage : null;

	return buildSubcategoryMetadata({
		category,
		subcategory,
		locale,
		hasFilteringParams,
		canonicalPage,
	});
}

async function buildSubcategoryMetadata({
	category,
	subcategory,
	locale,
	hasFilteringParams,
	canonicalPage,
}: {
	category: string;
	subcategory: string;
	locale: string;
	hasFilteringParams: boolean;
	canonicalPage: number | null;
}): Promise<Metadata> {
	'use cache';
	cacheLife('hours');

	const subcategoryData = await getSubcategoryNameBySlug(subcategory, locale);
	if (!subcategoryData) notFound();

	const pagesT = await getTranslations({ locale, namespace: 'pages' });
	const title = pagesT('metadata.category', { category: subcategoryData.subcategoryName });
	const description = pagesT('metadata.categoryDescription', {
		category: subcategoryData.subcategoryName,
	});
	const canonicalSearchParams =
		canonicalPage != null ? { page: `${canonicalPage}` } : undefined;
	const alternates = buildLanguageAlternates(
		locale as AppLocale,
		`/products/${category}/${subcategory}`,
		canonicalSearchParams,
	);
	const ogImage = absoluteUrl('/assets/images/logoBig.webp');

	return {
		title,
		description,
		alternates,
		robots: hasFilteringParams ? { index: false, follow: true } : { index: true, follow: true },
		openGraph: {
			title,
			description,
			type: 'website',
			url: alternates.canonical,
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

export default async function Subcategory({ params, searchParams }: Props) {
	const { category, subcategory, locale } = ensureParams(subcategoryParamsSchema, await params);
	const headersList = await headers();
	const cspNonce = headersList.get('x-csp-nonce') ?? undefined;
	const searchData = await searchParams;

	const page = resolvePageParam(searchData.page || '1');
	const pageSize = resolvePerPageParam(searchData.perPage || `${PRODUCTS_PER_PAGE}`);
	const offset = resolveOffset(page, pageSize);

	const [productsT, navigationT, pagesT] = await Promise.all([
		getTranslations({ locale, namespace: 'products' }),
		getTranslations({ locale, namespace: 'navigation' }),
		getTranslations({ locale, namespace: 'pages' }),
	]);
	const homeLabel = pagesT('main.title');

	const minPrice = searchData?.min ? parseFloat(searchData?.min) : undefined;
	const maxPrice = searchData?.max ? parseFloat(searchData?.max) : undefined;

	const isSimilarSearchMode = searchData.search === 'similar';
	const onlyInStock = isSimilarSearchMode;
	const orderBy = searchData?.orderBy as 'new' | 'expensive' | 'cheap' | undefined;

	const inStockParam = searchData?.inStock;
	let inStock: boolean | undefined = undefined;

	if (inStockParam === 'true') inStock = true;
	if (inStockParam === 'false') inStock = false;

	const excluded = SUBCATEGORY_FILTER_EXCLUDED_KEYS;
	const dynamicFilters: Record<string, string[]> = {};

	for (const [key, value] of Object.entries(searchData)) {
		if (!excluded.includes(key) && value) {
			const values = Array.isArray(value) ? value : [value];
			for (const item of values) {
				if (!item) continue;
				if (!dynamicFilters[key]) dynamicFilters[key] = [];
				dynamicFilters[key].push(item);
			}
		}
	}

	const subcategoryFiltersPromise = getSubcategoryFilters(subcategory);
	const subcategoryDataPromise = getProductsBySubcategorySlug(
		subcategory,
		pageSize,
		offset,
		onlyInStock,
		inStock,
		minPrice,
		maxPrice,
		orderBy,
		dynamicFilters,
		locale,
	);

	const [subcategoryFilters, subcategoryData] = await Promise.all([
		subcategoryFiltersPromise,
		subcategoryDataPromise,
	]);

	if (!subcategoryData) notFound();

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
				name: subcategoryData.categoryName,
				item: absoluteUrl(localizePath(locale, `/products/${category}`)),
			},
			{
				'@type': 'ListItem',
				position: 3,
				name: subcategoryData.subcategoryName,
				item: absoluteUrl(localizePath(locale, `/products/${category}/${subcategory}`)),
			},
		],
	};

	return (
		<Flex mx={{ base: '12px', '2xl': 0 }} gap={8} direction='column'>
			<Script id='subcategory-breadcrumbs-schema' nonce={cspNonce} type='application/ld+json'>
				{JSON.stringify(breadcrumbsJsonLd)}
			</Script>
			<Breadcrumbs
				categorySlug={category}
				subcategorySlug={subcategory}
				categoryName={subcategoryData.categoryName}
				subcategoryName={subcategoryData.subcategoryName}
			/>
			<Heading as='h1' size='2xl' fontWeight='medium'>
				{subcategoryData.subcategoryName}
			</Heading>
			{!isSimilarSearchMode ? (
				<Flex hideFrom='lg' justifyContent='flex-end'>
					<FiltersSidebar
						filters={subcategoryFilters}
						maxProductPrice={subcategoryData.maxProductPrice}
						btnText={navigationT('sidebar.filters')}
					/>
				</Flex>
			) : null}
			{!isSimilarSearchMode ? <FiltersTags filters={subcategoryFilters} /> : null}

			<Group justifyContent='space-between' align='flex-start' gap='3'>
				{!isSimilarSearchMode ? (
					<Box
						as='aside'
						w='304px'
						flexShrink={0}
						bg='bg.tertiary'
						minH='800px'
						rounded='xl'
						borderWidth='0.5px'
						borderStyle='solid'
						borderColor='border'
						boxShadow={{
							base: '0 1px 12px rgba(0, 0, 0, 0.06)',
							_dark: '0 1px 16px rgba(0, 0, 0, 0.35)',
						}}
						overflow='hidden'
						hideBelow='lg'
						position='sticky'
						top='74px'
					>
						<CatalogBtn fullText />
						<VStack p='4' justifyContent='flex-start'>
							<HStack w='full' gapX='4' mt='2' align='center'>
								<Text fontSize='md' fontWeight='semibold' color='main'>
									{productsT('totalProducts')}
								</Text>
								<CountPill
									value={subcategoryData?.totalCount ?? 0}
									px='2'
									py='1'
									labelProps={{ fontSize: 'sm' }}
								/>
							</HStack>
							<Separator color='border' w='full' my='2' />
							<QuickFilters maxProductPrice={subcategoryData.maxProductPrice} />
							<Filters filters={subcategoryFilters} />
						</VStack>
					</Box>
				) : null}

				<Box as='section' w='100%' flex='1' minW={0}>
					<ProductsGrid
						products={subcategoryData.products}
						notFound={productsT('productsNotFound')}
						limit={pageSize}
					/>
					{(subcategoryData?.totalCount ?? 0) > 0 && (
						<Pagination
							currentPage={page}
							totalItems={subcategoryData?.totalCount || 0}
							pageSize={pageSize}
							baseRoute={`/products/${category}/${subcategory}`}
						/>
					)}
				</Box>
			</Group>

			<ViewedProductsSection title={productsT('viewed')} tag='viewed' locale={locale} />
		</Flex>
	);
}
