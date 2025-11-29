import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Breadcrumbs from '@/components/ui/links/Breadcrumbs';
import ProductsGrid from '../../_components/ProductsGrid';
import { Flex, Heading, Box, Group, VStack, Text, Highlight, Separator } from '@chakra-ui/react';
import CatalogBtn from '@/components/ui/buttons/CatalogBtn';
import QuickFilters from '../../_components/QuickFilters';
import Filters from '../../_components/Filters';
import FiltersSidebar from '../../_components/FiltersSidebar';
import ProductsSection from '@/features/catalog/ProductsSection';
import FiltersTags from '../../_components/FiltersTags';
import { getProductsBySubcategorySlug } from '@/actions/products/getProductsBySubcategorySlug';
import { Metadata } from 'next';
import Pagination from '@/components/ui/Pagination';
import { getSubcategoryNameBySlug } from '@/actions/products/getSubcategoryNameBySlug';
import { getSubcategoryFilters } from '@/actions/products/getProductsFilters';

type Params = {
	params: { category: string; subcategory: string };
	searchParams: {
		page?: string;
		search?: string;
		min?: string;
		max?: string;
		inStock?: string;
		orderBy?: 'new' | 'expensive' | 'cheap';
	};
};

const PRODUCTS_PER_PAGE = 12;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
	const { subcategory } = await params;

	const subcategoryData = await getSubcategoryNameBySlug(subcategory);
	if (!subcategoryData) notFound();

	const t = await getTranslations('pages');
	const title = t('metadata.category', { category: subcategoryData.subcategoryName });

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

	const t = await getTranslations('products');
	const sidebarT = await getTranslations('navigation');

	const minPrice = searchData?.min ? parseFloat(searchData?.min) : undefined;
	const maxPrice = searchData?.max ? parseFloat(searchData?.max) : undefined;

	const onlyInStock = searchData.search === 'similar';
	const orderBy = searchData?.orderBy as 'new' | 'expensive' | 'cheap' | undefined;

	const inStockParam = searchData?.inStock;
	let inStock: boolean | undefined = undefined;

	if (inStockParam === 'true') inStock = true;
	if (inStockParam === 'false') inStock = false;

	const excluded = ['page', 'search', 'min', 'max', 'inStock', 'orderBy'];
	const dynamicFilters: Record<string, string[]> = {};

	for (const [key, value] of Object.entries(searchData)) {
		if (!excluded.includes(key) && value) {
			if (!dynamicFilters[key]) dynamicFilters[key] = [];
			dynamicFilters[key].push(value);
		}
	}

	const subcategoryFilters = await getSubcategoryFilters(subcategory);
	const subcategoryData = await getProductsBySubcategorySlug(
		subcategory,
		PRODUCTS_PER_PAGE,
		offset,
		onlyInStock,
		inStock,
		minPrice,
		maxPrice,
		orderBy,
		dynamicFilters
	);

	if (!subcategoryData) notFound();

	return (
		<Flex mx={{ base: '12px', '2xl': 0 }} gap={8} direction='column'>
			<Breadcrumbs
				categorySlug={category}
				subcategorySlug={subcategory}
				categoryName={subcategoryData.categoryName}
				subcategoryName={subcategoryData.subcategoryName}
			/>
			<Heading as='h1' size='3xl' fontWeight='medium'>
				{subcategoryData.subcategoryName}
			</Heading>
			<Flex hideFrom='lg' justifyContent='flex-end'>
				<FiltersSidebar
					filters={subcategoryFilters}
					maxProductPrice={subcategoryData.maxProductPrice}
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
						<Text w='full'>
							<Highlight
								query={subcategoryData?.totalCount?.toString()}
								styles={{ fontWeight: 'semibold' }}
							>
								{`${t('totalProducts')}: ${subcategoryData?.totalCount}`}
							</Highlight>
						</Text>
						<Separator color='border.light' w='full' my='2' />
						<QuickFilters maxProductPrice={subcategoryData.maxProductPrice} />
						<Filters filters={subcategoryFilters} />
					</VStack>
				</Box>

				<Box as='section' w={{ base: '100%', lg: '80%' }}>
					<ProductsGrid products={subcategoryData.products} notFound={t('productsNotFound')} />
					<Pagination
						currentPage={page}
						totalProductsCount={subcategoryData?.totalCount || 0}
						productsPerPage={PRODUCTS_PER_PAGE}
						baseRoute={`/products/${category}/${subcategory}`}
					/>
				</Box>
			</Group>

			<ProductsSection title={t('viewed')} tag='viewed' />
		</Flex>
	);
}
