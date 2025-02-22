import Breadcrumbs from '@/components/reusable/links/Breadcrumbs';
import { useTranslations } from 'next-intl';
import { Flex, Heading, Box, Group, VStack } from '@chakra-ui/react';
import CatalogBtn from '@/components/reusable/buttons/CatalogBtn';
import QuickFilters from '@/components/pages/products/QuickFilters';
import Filters from '@/components/pages/products/Filters';
import ProductsGrid from '@/components/pages/products/ProductsGrid';
import FiltersSidebar from '@/components/pages/products/FiltersSidebar';
import ProductsSection from '@/components/pages/main/ProductsSection';

interface Props {
	params: { category: string; subcategory: string };
}

export default function Subcategory({ params }: Props) {
	const t = useTranslations('Products');
	const { subcategory = 'Технika' } = params;
	return (
		<Flex mx={{ base: '12px', '2xl': 0 }} gap={8} direction='column'>
			<Breadcrumbs {...params} />
			<Heading as='h1' size='4xl' fontWeight='medium'>
				{subcategory}
			</Heading>
			<Flex hideFrom='lg' justifyContent='flex-end'>
				<FiltersSidebar />
			</Flex>

			<Group justifyContent='space-between' align='flex-start'>
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
