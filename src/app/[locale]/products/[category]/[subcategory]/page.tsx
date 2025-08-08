import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Breadcrumbs from '@/components/reusable/links/Breadcrumbs';
import ProductsGrid from '@/components/pages/products/ProductsGrid';
import { Flex, Heading, Box, Group, VStack, Text, Highlight, Separator } from '@chakra-ui/react';
import CatalogBtn from '@/components/reusable/buttons/CatalogBtn';
import QuickFilters from '@/components/pages/products/QuickFilters';
import Filters from '@/components/pages/products/Filters';
import FiltersSidebar from '@/components/pages/products/FiltersSidebar';
import ProductsSection from '@/components/pages/main/ProductsSection';
import FiltersTags from '@/components/pages/products/FiltersTags';
import { getProductsBySubcategorySlug } from '@/actions/products/getProductsBySubcategorySlug';
import { Metadata } from 'next';
import Pagination from '@/components/reusable/Pagination';

type Params = {
	params: { category: string; subcategory: string };
	searchParams: { page?: string };
};

const PRODUCTS_PER_PAGE = 4;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
	const { subcategory } = await params;

	const t = await getTranslations('Metadata');
	const title = t('category', { category: subcategory });

	return {
		title,
		description: '',
	};
}

export default async function Subcategory({ params, searchParams }: Params) {
	const { category, subcategory } = await params;
	const searchData = await searchParams;

	const page = parseInt(searchData.page || '1', 10);
	const offset = (page - 1) * PRODUCTS_PER_PAGE;

	const t = await getTranslations('Products');
	const sidebarT = await getTranslations('Sidebar');

	const subcategoryData = await getProductsBySubcategorySlug(
		subcategory,
		PRODUCTS_PER_PAGE,
		offset
	);

	if (!subcategoryData) notFound();

	return (
		<Flex mx={{ base: '12px', '2xl': 0 }} gap={8} direction='column'>
			<Breadcrumbs
				categorySlug={category}
				subcategorySlug={subcategory}
				categoryName={subcategoryData?.categoryName}
				subcategoryName={subcategoryData?.subcategoryName}
			/>
			<Heading as='h1' size='4xl' fontWeight='medium'>
				{subcategoryData?.subcategoryName}
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
							<Highlight
								query={subcategoryData?.totalCount?.toString()}
								styles={{ fontWeight: 'semibold' }}
							>
								{`${t('totalProducts')}: ${subcategoryData?.totalCount}`}
							</Highlight>
						</Text>
						<Separator color='border.light' w='full' mb='2' />
						<QuickFilters />
						<Filters />
					</VStack>
				</Box>

				<Box as='section' w={{ base: '100%', lg: '80%' }}>
					<ProductsGrid
						products={subcategoryData?.products}
						category={category}
						subcategory={subcategory}
						notFound={t('productsNotFound')}
					/>
					<Pagination
						currentPage={page}
						totalProductsCount={subcategoryData?.totalCount || 0}
						productsPerPage={PRODUCTS_PER_PAGE}
						baseRoute={`/products/${category}/${subcategory}`}
					/>
				</Box>
			</Group>

			<ProductsSection title={t('viewed')} />
		</Flex>
	);
}
