import Breadcrumbs from '@/components/reusable/links/Breadcrumbs';
import { Flex, Heading, Box, Group, VStack } from '@chakra-ui/react';
import CatalogBtn from '@/components/reusable/buttons/CatalogBtn';
import QuickFilters from '@/components/pages/products/QuickFilters';
import Filters from '@/components/pages/products/Filters';
import ProductsGrid from '@/components/pages/products/ProductsGrid';
import FiltersSidebar from '@/components/pages/products/FiltersSidebar';
import ProductsSection from '@/components/pages/main/ProductsSection';
import FiltersTags from '@/components/pages/products/FiltersTags';
import { getTranslations } from 'next-intl/server';

interface Props {
	params: { category: string; subcategory: string };
}

export default async function Subcategory({ params }: Props) {
	const t = await getTranslations('Products');
	const sidebarT = await getTranslations('Sidebar');
	const { category, subcategory = 'Технika' } = params;

	return (
		<Flex mx={{ base: '12px', '2xl': 0 }} gap={8} direction='column'>
			<Breadcrumbs category={category} subcategory={subcategory} />
			<Heading as='h1' size='4xl' fontWeight='medium'>
				{subcategory}
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
					<ProductsGrid />
				</Box>
			</Group>
			<ProductsSection title={t('viewed')} />
		</Flex>
	);
}
