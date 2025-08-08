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
import SearchCategories from '@/components/pages/products/SearchCategories';

type Params = {
	searchParams: { searchQuery?: string; page?: string };
};

const PRODUCTS_PER_PAGE = 4;

export async function generateMetadata({ searchParams }: Params): Promise<Metadata> {
	const searchData = await searchParams;
	const t = await getTranslations('Products');
	const title = t('searchQueryResults', { searchQuery: searchData?.searchQuery || '' });
	return {
		title,
		description: '',
	};
}

export default async function SearchProducts({ searchParams }: Params) {
	const searchData = await searchParams;
	const t = await getTranslations('Products');
	const sidebarT = await getTranslations('Sidebar');

	const query = searchData?.searchQuery || '';
	const page = parseInt(searchData.page || '1', 10);
	const offset = (page - 1) * PRODUCTS_PER_PAGE;

	const { products, subcategories, totalCount } = await getProductsBySearchQuery(
		query,
		PRODUCTS_PER_PAGE,
		offset
	);

	return (
		<Flex mx={{ base: '12px', '2xl': 0 }} gap={8} direction='column'>
			<Heading as='h1' size='4xl' fontWeight='medium'>
				{t('searchQueryResults', { searchQuery: query })}
			</Heading>

			<Flex hideFrom='lg' justifyContent='flex-end'>
				<FiltersSidebar btnText={sidebarT('filters')} />
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

						<QuickFilters />
						<Filters />
					</VStack>
				</Box>

				<Box as='section' w={{ base: '100%', lg: '80%' }}>
					<ProductsGrid products={products} notFound={t('productsNotFound')} />
					<Pagination
						currentPage={page}
						totalProductsCount={totalCount}
						productsPerPage={PRODUCTS_PER_PAGE}
						baseRoute={`/products/search/`}
					/>
				</Box>
			</Group>

			<ProductsSection title={t('viewed')} />
		</Flex>
	);
}
