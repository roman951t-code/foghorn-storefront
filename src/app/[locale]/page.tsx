import { Flex, Box } from '@chakra-ui/react';
import CatalogPanel from '@/components/pages/main/CatalogPanel';
import ProductsSection from '@/components/pages/main/ProductsSection';
import SubscribeSection from '@/components/pages/main/SubscribeSection';
import CatalogBtn from '@/components/reusable/buttons/CatalogBtn';
import { useTranslations } from 'next-intl';
import { extractI18nData } from '@/utils/i18nUtils';

export default function Main() {
	const genT = useTranslations('General');

	const i18nData = extractI18nData(genT, ['seeCategory', 'seeAll']);

	return (
		<Flex mx={{ base: '12px', '2xl': 0 }} direction='column'>
			<Box hideFrom='sm' mb='24px'>
				<CatalogBtn fullText />
			</Box>
			<CatalogPanel i18nData={i18nData} />
			{/* <ProductsSection title={t('popular')} />
			<ProductsSection title={t('new')} />
			<ProductsSection title={t('discount')} />
			<ProductsSection title={t('promotional')} />
			<ProductsSection title={t('viewed')} /> */}
			<SubscribeSection />
		</Flex>
	);
}
