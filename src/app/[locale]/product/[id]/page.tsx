import Breadcrumbs from '@/components/reusable/links/Breadcrumbs';
import { useTranslations } from 'next-intl';
import { Flex } from '@chakra-ui/react';
import CatalogBtn from '@/components/reusable/buttons/CatalogBtn';
import ProductsSection from '@/components/pages/main/ProductsSection';
import SubscribeSection from '@/components/pages/main/SubscribeSection';
import ProductTabs from '@/components/product/ProductTabs';

export default function ProductDetail() {
	const t = useTranslations('Products');
	return (
		<Flex mx={{ base: '12px', '2xl': 0 }} gap={4} direction='column'>
			<Breadcrumbs />
			{/* <Flex hideBelow='md' mt='4'>
				<CatalogBtn fullText />
			</Flex> */}
			<ProductTabs />
			{/* <ProductsSection title={t('similar')} mb='0' />
			<SubscribeSection /> */}
		</Flex>
	);
}
