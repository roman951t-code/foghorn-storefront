// src/app/page.tsx

import { Flex, Box } from '@chakra-ui/react';
import CatalogPanel from '@/components/pages/main/CatalogPanel';
import ProductsSection from '@/components/pages/main/ProductsSection';
import SubscribeSection from '@/components/pages/main/SubscribeSection';
import CatalogBtn from '@/components/reusable/buttons/CatalogBtn';
import { useTranslations } from 'next-intl';

export default function Main() {
	const t = useTranslations('Products');

	return (
		<Flex mx={{ base: '12px', '2xl': 0 }} direction='column'>
			<Box hideFrom='sm' mb='24px'>
				<CatalogBtn fullText />
			</Box>
			<CatalogPanel />
			{/* <ProductsSection title={t('popular')} />
			<ProductsSection title={t('new')} />
			<ProductsSection title={t('discount')} />
			<ProductsSection title={t('promotional')} />
			<ProductsSection title={t('viewed')} /> */}
			<SubscribeSection />
		</Flex>
	);
}
