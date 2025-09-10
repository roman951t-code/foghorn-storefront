import { getTranslations } from 'next-intl/server';
import { Flex, Heading, Box, Group, VStack, Highlight, Text } from '@chakra-ui/react';
import CatalogBtn from '@/components/reusable/buttons/CatalogBtn';
import QuickFilters from '@/components/pages/products/QuickFilters';
import Filters from '@/components/pages/products/Filters';
import FiltersSidebar from '@/components/pages/products/FiltersSidebar';
import ProductsSection from '@/components/pages/main/ProductsSection';
import FiltersTags from '@/components/pages/products/FiltersTags';
import ProductsGrid from '@/components/pages/products/ProductsGrid';
import Pagination from '@/components/reusable/Pagination';
import { Metadata } from 'next';
import { getProductsBySearchQuery } from '@/actions/products/getProductsBySearchQuery';
import { getProductsByTag } from '@/actions/products/getProductsByTag';
import SearchCategories from '@/components/pages/products/SearchCategories';
import { getSearchFilters, getTagFilters } from '@/actions/products/getProductsFilters';

type Params = {
	searchParams: {
		searchQuery?: string;
		tag?: string;
		page?: string;
		min?: string;
		max?: string;
		inStock?: string;
		orderBy?: 'new' | 'expensive' | 'cheap';
	};
};

const PRODUCTS_PER_PAGE = 12;

export async function generateMetadata({ searchParams }: Params): Promise<Metadata> {
	const { searchQuery, tag } = await searchParams;
	const t = await getTranslations('Products');
	const title = t('searchQueryResults', { searchQuery: tag ? t(tag) : searchQuery || '' });

	return {
		title,
		description: '',
	};
}

export default async function SearchProducts({ searchParams }: Params) {
	const { searchQuery = '', tag, page: pageParam = '1', min = 0, max = 0 } = await searchParams;
	const searchData = await searchParams;
	const t = await getTranslations('Products');
	const sidebarT = await getTranslations('Sidebar');

	const page = parseInt(pageParam, 10);
	const offset = (page - 1) * PRODUCTS_PER_PAGE;

	const minPrice = min ? parseFloat(min) : undefined;
	const maxPrice = max ? parseFloat(max) : undefined;

	const orderBy = searchData?.orderBy as 'new' | 'expensive' | 'cheap' | undefined;

	const inStockParam = searchData?.inStock;
	let inStock: boolean | undefined = undefined;

	if (inStockParam === 'true') inStock = true;
	if (inStockParam === 'false') inStock = false;

	let products: any[] = [];
	let filters: any[] = [];
	let subcategories: any[] = [];
	let totalCount = 0;
	let maxProductPrice = 0;
	const excluded = ['searchQuery', 'tag', 'page', 'search', 'min', 'max', 'inStock', 'orderBy'];
	const dynamicFilters: Record<string, string[]> = {};

	for (const [key, value] of Object.entries(searchData)) {
		if (!excluded.includes(key) && value) {
			if (!dynamicFilters[key]) dynamicFilters[key] = [];
			dynamicFilters[key].push(value);
		}
	}

	if (tag) {
		const result = await getProductsByTag(
			tag,
			true,
			PRODUCTS_PER_PAGE,
			offset,
			minPrice,
			maxPrice,
			inStock,
			orderBy,
			dynamicFilters
		);

		filters = await getTagFilters(tag);
		products = result.products;
		subcategories = result?.subcategories;
		totalCount = result?.totalCount;
		maxProductPrice = result.maxProductPrice;
	} else {
		const result = await getProductsBySearchQuery(
			searchQuery,
			PRODUCTS_PER_PAGE,
			offset,
			minPrice,
			maxPrice,
			inStock,
			orderBy,
			dynamicFilters
		);

		filters = await getSearchFilters(searchQuery);
		products = result.products;
		subcategories = result.subcategories;
		totalCount = result.totalCount;
		maxProductPrice = result.maxProductPrice;
	}

	return (
		<Flex mx={{ base: '12px', '2xl': 0 }} gap={8} direction='column'>
			<Heading as='h1' size='3xl' fontWeight='medium'>
				{t('searchQueryResults', { searchQuery: tag ? t(tag) : searchQuery || '' })}
			</Heading>

			<Flex hideFrom='lg' justifyContent='flex-end'>
				<FiltersSidebar
					filters={filters}
					maxProductPrice={maxProductPrice}
					btnText={sidebarT('filters')}
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
						<Text w='full'>
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
					<ProductsGrid products={products} notFound={t('productsNotFound')} />
					<Pagination
						currentPage={page}
						totalProductsCount={totalCount}
						productsPerPage={PRODUCTS_PER_PAGE}
						baseRoute='/products/search/'
					/>
				</Box>
			</Group>

			<ProductsSection title={t('viewed')} tag='viewed' />
		</Flex>
	);
}
