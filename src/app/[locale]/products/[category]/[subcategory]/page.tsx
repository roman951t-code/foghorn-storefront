import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Breadcrumbs from '@/components/ui/links/Breadcrumbs';
import ProductsGrid from '../../_components/ProductsGrid';
import { Flex, Heading, Box, Group, VStack, Text, Highlight, Separator } from '@chakra-ui/react';
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
import { PRODUCTS_PER_PAGE } from '@/constants/pagination';
import { SUBCATEGORY_FILTER_EXCLUDED_KEYS } from '@/constants/products';
import { buildLanguageAlternates } from '@/utils/seo';
import type { AppLocale } from '@/constants/locales';

type Params = {
	params: { category: string; subcategory: string; locale: AppLocale };
	searchParams: {
		page?: string;
		perPage?: string;
		search?: string;
		min?: string;
		max?: string;
		inStock?: string;
		orderBy?: 'new' | 'expensive' | 'cheap';
	};
};

export async function generateMetadata({ params, searchParams }: Params): Promise<Metadata> {
	const { category, subcategory, locale } = await params;
	const resolvedSearch = await searchParams;

	const subcategoryData = await getSubcategoryNameBySlug(subcategory);
	if (!subcategoryData) notFound();

	const t = await getTranslations('pages');
	const title = t('metadata.category', { category: subcategoryData.subcategoryName });
	const description = t('metadata.categoryDescription', { category: subcategoryData.subcategoryName });

	return {
		title,
		description,
		alternates: buildLanguageAlternates(
			locale,
			`/products/${category}/${subcategory}`,
			resolvedSearch ?? undefined
		),
	};
}

export default async function Subcategory({ params, searchParams }: Params) {
	const { category, subcategory } = await params;
	const searchData = await searchParams;

	const page = Math.max(1, parseInt(searchData.page || '1', 10) || 1);
	const requestedPerPage = parseInt(searchData.perPage || `${PRODUCTS_PER_PAGE}`, 10);
	const pageSize =
		Number.isNaN(requestedPerPage) || requestedPerPage <= 0 ? PRODUCTS_PER_PAGE : requestedPerPage;
	const offset = (page - 1) * pageSize;

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

	const excluded = SUBCATEGORY_FILTER_EXCLUDED_KEYS;
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
		pageSize,
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
					<ProductsGrid
						products={subcategoryData.products}
						notFound={t('productsNotFound')}
						limit={pageSize}
					/>
					<Pagination
						currentPage={page}
						totalItems={subcategoryData?.totalCount || 0}
						pageSize={pageSize}
						baseRoute={`/products/${category}/${subcategory}`}
					/>
				</Box>
			</Group>

			<ViewedProductsSection title={t('viewed')} tag='viewed' />
		</Flex>
	);
}
