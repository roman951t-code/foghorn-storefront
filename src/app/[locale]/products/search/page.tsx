import { getTranslations } from 'next-intl/server';
import { Flex, Heading, Box, Group, VStack, Text, HStack } from '@chakra-ui/react';
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
import { getRecentlyViewedProductsWithCount } from '@/actions/products/getRecentlyViewedProducts';
import { PRODUCTS_PER_PAGE } from '@/constants/pagination';
import { absoluteUrl, buildLanguageAlternates } from '@/utils/seo';
import { LocaleParams, ProductFiltersSearchParams } from '@/types/routing';
import CountPill from '@/components/ui/CountPill';

type Props = LocaleParams & {
	searchParams: ProductFiltersSearchParams;
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

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
	const resolvedSearch = await searchParams;
	const { searchQuery, tag } = resolvedSearch;
	const { locale } = await params;
	const [productsT, pagesT] = await Promise.all([
		getTranslations('products'),
		getTranslations('pages'),
	]);
	const title = productsT('searchQueryResults', {
		searchQuery: tag ? productsT(tag) : searchQuery || '',
	});
	const description = pagesT('metadata.searchDescription', {
		query: tag ? productsT(tag) : searchQuery || '',
	});
	const alternates = buildLanguageAlternates(locale, '/products/search');
	const tagImageMap: Record<string, string> = {
		popular: '/assets/images/carousel1.webp',
		new: '/assets/images/carousel2.webp',
		discount: '/assets/images/carousel3.webp',
		viewed: '/assets/images/logoSmall.webp',
	};
	const ogImagePath = tag
		? tagImageMap[tag] ?? '/assets/images/logoBig.webp'
		: '/assets/images/logoBig.webp';
	const ogImage = absoluteUrl(ogImagePath);

	return {
		title,
		description,
		alternates,
		robots: { index: false, follow: true },
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

export default async function SearchProducts({ params, searchParams }: Props) {
	const { locale } = await params;
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

	const [productsT, navigationT] = await Promise.all([
		getTranslations('products'),
		getTranslations('navigation'),
	]);

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
			const values = Array.isArray(value) ? value : [value];
			values.forEach((item) => {
				if (!item) return;
				acc[key] = acc[key] || [];
				acc[key].push(item);
			});
			return acc;
		},
		{}
	);

	const buildViewedResponse = async () => {
		const session = await auth.api.getSession({ headers: await headers() });
		const userId = session?.user?.id;
		const viewed = userId
			? await getRecentlyViewedProductsWithCount(userId, pageSize, offset, locale)
			: { products: [], totalCount: 0 };
		const viewedProducts = viewed.products;

		const highestPrice = viewedProducts.reduce(
			(max, p) => Math.max(max, p.discountPrice ?? p.basePrice ?? 0),
			0
		);

		return {
			products: viewedProducts,
			filters: [],
			subcategories: [],
			totalCount: viewed.totalCount,
			maxProductPrice: highestPrice,
		};
	};

	const buildTagResponse = async (tagValue: string) => {
		const [result, tagFilters] = await Promise.all([
			getProductsByTag(
				tagValue,
				true,
				pageSize,
				offset,
				minPrice,
				maxPrice,
				inStock,
				orderBy,
				dynamicFilters,
				locale
			),
			getTagFilters(tagValue),
		]);

		return {
			products: result.products,
			filters: tagFilters,
			subcategories: result?.subcategories ?? [],
			totalCount: result?.totalCount ?? 0,
			maxProductPrice: result.maxProductPrice,
		};
	};

	const buildSearchResponse = async () => {
		const [result, searchFilters] = await Promise.all([
			getProductsBySearchQuery(
				searchQuery,
				pageSize,
				offset,
				minPrice,
				maxPrice,
				inStock,
				orderBy,
				dynamicFilters,
				locale
			),
			getSearchFilters(searchQuery, locale),
		]);

		return {
			products: result.products,
			filters: searchFilters,
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
				{productsT('searchQueryResults', {
					searchQuery: tag ? productsT(tag) : searchQuery || '',
				})}
			</Heading>

			<Flex hideFrom='lg' justifyContent='flex-end'>
				<FiltersSidebar
					filters={filters}
					maxProductPrice={maxProductPrice}
					btnText={navigationT('sidebar.filters')}
				/>
			</Flex>

			<FiltersTags filters={filters} />

			<Group justifyContent='space-between' align='flex-start' gap='3'>
				<Box
					as='aside'
					w='304px'
					flexShrink={0}
					bg='bg.tertiary'
					minH='800px'
					rounded='lg'
					hideBelow='lg'
					position='sticky'
					top='74px'
				>
					<CatalogBtn fullText />

					<VStack p='4' justifyContent='flex-start'>
						<HStack w='full' justify='flex-start' align='center' mb='1.5'>
							<Text fontSize='sm' color='fg.muted'>
								{productsT('totalProducts')}
							</Text>
							<CountPill value={totalCount ?? 0} labelProps={{ fontSize: 'sm' }} />
						</HStack>

						<SearchCategories data={subcategories} allCategories={productsT('allCategories')} />

						<QuickFilters maxProductPrice={maxProductPrice} />
						<Filters filters={filters} />
					</VStack>
				</Box>

				<Box as='section' w='100%' flex='1' minW={0}>
					<ProductsGrid
						products={products}
						notFound={productsT('productsNotFound')}
						limit={pageSize}
					/>
					{(totalCount ?? 0) > 0 && (
						<Pagination
							currentPage={page}
							totalItems={totalCount}
							pageSize={pageSize}
							baseRoute='/products/search/'
						/>
					)}
				</Box>
			</Group>

			<ViewedProductsSection title={productsT('viewed')} tag='viewed' locale={locale} />
		</Flex>
	);
}
