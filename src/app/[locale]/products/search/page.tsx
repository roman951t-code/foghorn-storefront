import { getTranslations } from 'next-intl/server';
import { Flex, Heading, Box, Group, VStack, Highlight, Text } from '@chakra-ui/react';
import CatalogBtn from '@/components/ui/buttons/CatalogBtn';
import QuickFilters from '../_components/QuickFilters';
import Filters from '../_components/Filters';
import FiltersSidebar from '../_components/FiltersSidebar';
import FiltersTags from '../_components/FiltersTags';
import ViewedProductsSection from '@/features/catalog/ViewedProductsSection';
import ProductsGrid from '../_components/ProductsGrid';
import Pagination from '@/components/ui/Pagination';
import { Metadata } from 'next';
import { getProductsBySearchQuery } from '@/actions/products/getProductsBySearchQuery';
import { getProductsByTag } from '@/actions/products/getProductsByTag';
import SearchCategories from '../_components/SearchCategories';
import { getSearchFilters, getTagFilters } from '@/actions/products/getProductsFilters';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getRecentlyViewedProducts } from '@/actions/products/getRecentlyViewedProducts';
import { PRODUCTS_PER_PAGE } from '@/constants/pagination';
import { buildLanguageAlternates } from '@/utils/seo';
import type { AppLocale } from '@/constants/locales';

type Params = {
	params: { locale: AppLocale };
	searchParams: {
		searchQuery?: string;
		tag?: string;
		page?: string;
		perPage?: string;
		min?: string;
		max?: string;
		inStock?: string;
		orderBy?: 'new' | 'expensive' | 'cheap';
	};
};

const excludedParams = new Set([
	'searchQuery',
	'tag',
	'page',
	'perPage',
	'search',
	'min',
	'max',
	'inStock',
	'orderBy',
]);

export async function generateMetadata({ params, searchParams }: Params): Promise<Metadata> {
	const resolvedSearch = await searchParams;
	const { searchQuery, tag } = resolvedSearch;
	const { locale } = await params;
	const t = await getTranslations('products');
	const title = t('searchQueryResults', { searchQuery: tag ? t(tag) : searchQuery || '' });
	const pagesT = await getTranslations('pages');
	const description = pagesT('metadata.searchDescription', { query: tag ? t(tag) : searchQuery || '' });

	return {
		title,
		description,
		alternates: buildLanguageAlternates(locale, '/products/search', resolvedSearch ?? undefined),
	};
}

export default async function SearchProducts({ searchParams }: Params) {
	const searchData = await searchParams;
	const {
		searchQuery = '',
		tag,
		page: pageParam = '1',
		min,
		max,
		inStock: inStockParam,
		orderBy: orderByParam,
	} = searchData;

	const t = await getTranslations('products');
	const sidebarT = await getTranslations('navigation');

	const parsedPage = Number.parseInt(pageParam, 10);
	const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
	const requestedPerPage = Number.parseInt(searchData.perPage ?? `${PRODUCTS_PER_PAGE}`, 10);
	const pageSize =
		Number.isNaN(requestedPerPage) || requestedPerPage <= 0 ? PRODUCTS_PER_PAGE : requestedPerPage;
	const offset = (page - 1) * pageSize;
	const minPrice = min ? Number.parseFloat(min) : undefined;
	const maxPrice = max ? Number.parseFloat(max) : undefined;
	const orderBy = orderByParam as 'new' | 'expensive' | 'cheap' | undefined;
	const inStock = inStockParam === 'true' ? true : inStockParam === 'false' ? false : undefined;

	const dynamicFilters = Object.entries(searchData).reduce<Record<string, string[]>>(
		(acc, [key, value]) => {
			if (!value || excludedParams.has(key)) return acc;
			acc[key] = acc[key] || [];
			acc[key].push(value);
			return acc;
		},
		{}
	);

	const buildViewedResponse = async () => {
		const session = await auth.api.getSession({ headers: await headers() });
		const userId = session?.user?.id;
		const viewedProducts = userId ? await getRecentlyViewedProducts(userId, pageSize) : [];

		const highestPrice = viewedProducts.reduce(
			(max, p) => Math.max(max, p.discountPrice ?? p.basePrice ?? 0),
			0
		);

		return {
			products: viewedProducts,
			filters: [],
			subcategories: [],
			totalCount: viewedProducts.length,
			maxProductPrice: highestPrice,
		};
	};

	const buildTagResponse = async (tagValue: string) => {
		const result = await getProductsByTag(
			tagValue,
			true,
			pageSize,
			offset,
			minPrice,
			maxPrice,
			inStock,
			orderBy,
			dynamicFilters
		);

		return {
			products: result.products,
			filters: await getTagFilters(tagValue),
			subcategories: result?.subcategories ?? [],
			totalCount: result?.totalCount ?? 0,
			maxProductPrice: result.maxProductPrice,
		};
	};

	const buildSearchResponse = async () => {
		const result = await getProductsBySearchQuery(
			searchQuery,
			pageSize,
			offset,
			minPrice,
			maxPrice,
			inStock,
			orderBy,
			dynamicFilters
		);

		return {
			products: result.products,
			filters: await getSearchFilters(searchQuery),
			subcategories: result.subcategories,
			totalCount: result.totalCount,
			maxProductPrice: result.maxProductPrice,
		};
	};

	const { products, filters, subcategories, totalCount, maxProductPrice } =
		tag === 'viewed'
			? await buildViewedResponse()
			: tag
			? await buildTagResponse(tag)
			: await buildSearchResponse();

	return (
		<Flex mx={{ base: '12px', '2xl': 0 }} gap={8} direction='column'>
			<Heading as='h1' size='3xl' fontWeight='medium'>
				{t('searchQueryResults', { searchQuery: tag ? t(tag) : searchQuery || '' })}
			</Heading>

			<Flex hideFrom='lg' justifyContent='flex-end'>
				<FiltersSidebar
					filters={filters}
					maxProductPrice={maxProductPrice}
					btnText={sidebarT('sidebar.filters')}
				/>
			</Flex>

			<FiltersTags />

			<Group justifyContent='space-between' align='flex-start' gap='3'>
				<Box
					as='aside'
					w='20%'
					minW='232px'
					bg='bg.tertiary'
					minH='800px'
					rounded='sm'
					hideBelow='lg'
					position='sticky'
					top='74px'
				>
					<CatalogBtn fullText />

					<VStack p='4' justifyContent='flex-start'>
						<Text w='full' mb='1.5'>
							<Highlight query={totalCount?.toString()} styles={{ fontWeight: 'semibold' }}>
								{`${t('totalProducts')}: ${totalCount}`}
							</Highlight>
						</Text>

						<SearchCategories data={subcategories} allCategories={t('allCategories')} />

						<QuickFilters maxProductPrice={maxProductPrice} />
						<Filters filters={filters} />
					</VStack>
				</Box>

				<Box as='section' w={{ base: '100%', lg: '80%' }}>
					<ProductsGrid products={products} notFound={t('productsNotFound')} limit={pageSize} />
					<Flex justifyContent='center'>
						<Pagination
							currentPage={page}
							totalItems={totalCount}
							pageSize={pageSize}
							baseRoute='/products/search/'
						/>
					</Flex>
				</Box>
			</Group>

			<ViewedProductsSection title={t('viewed')} tag='viewed' />
		</Flex>
	);
}
