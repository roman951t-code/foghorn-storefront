import Breadcrumbs from '@/components/reusable/links/Breadcrumbs';
import { useTranslations } from 'next-intl';
import { Flex } from '@chakra-ui/react';
import CatalogBtn from '@/components/reusable/buttons/CatalogBtn';
import ProductsSection from '@/components/pages/main/ProductsSection';
import SubscribeSection from '@/components/pages/main/SubscribeSection';
import ProductTabs from '@/components/product/ProductTabs';

interface Props {
	params: { category: string; subcategory: string; productId: string };
}

export default async function ProductDetail({ params }: Props) {
	const { category, subcategory = 'Технika' } = params;

	const t = useTranslations('Products');
	return (
		<Flex mx={{ base: '12px', '2xl': 0 }} gap={4} direction='column'>
			<Breadcrumbs category={category} subcategory={subcategory} />
			{/* <Flex hideBelow='md' mt='4'>
				<CatalogBtn fullText />
			</Flex> */}
			<ProductTabs />
			{/* <ProductsSection title={t('similar')} mb='0' />
			<SubscribeSection /> */}
		</Flex>
	);
}
