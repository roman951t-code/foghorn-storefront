import { getTranslations } from 'next-intl/server';
import { Flex, Heading, Box, Group, VStack } from '@chakra-ui/react';
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

type Params = {
	searchParams: { searchQuery?: string };
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

	const { products } = await getProductsBySearchQuery(query);
	const page = 1;

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
					<VStack p='4' mt='4' justifyContent='flex-start'>
						<QuickFilters />
						<Filters />
					</VStack>
				</Box>

				<Box as='section' w={{ base: '100%', lg: '80%' }}>
					<ProductsGrid
						products={products}
						notFound={t('productsNotFound')}
						category=''
						subcategory=''
					/>
					<Pagination
						currentPage={page}
						totalProductsCount={products.length}
						productsPerPage={PRODUCTS_PER_PAGE}
						category=''
						subcategory=''
					/>
				</Box>
			</Group>

			<ProductsSection title={t('viewed')} />
		</Flex>
	);
}
