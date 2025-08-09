import { Flex, Box } from '@chakra-ui/react';
import CatalogPanel from '@/components/pages/main/CatalogPanel';
import ProductsSection from '@/components/pages/main/ProductsSection';
import SubscribeSection from '@/components/pages/main/SubscribeSection';
import CatalogBtn from '@/components/reusable/buttons/CatalogBtn';
import { extractI18nData, getLocalizedMetadata } from '@/utils/i18nUtils';
import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

type Params = {
	params: { locale: string };
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
	const { locale } = await params;
	return getLocalizedMetadata(locale, 'main');
}

export default async function Main() {
	const genT = await getTranslations('General');
	const prodT = await getTranslations('Products');

	const i18nData = extractI18nData(genT, ['seeCategory', 'seeAll']);

	return (
		<Flex mx={{ base: '12px', '2xl': 0 }} direction='column'>
			<Box hideFrom='sm' mb='24px'>
				<CatalogBtn fullText />
			</Box>
			<CatalogPanel i18nData={i18nData} />
			<ProductsSection title={prodT('popular')} tag='popular' />
			{/* <ProductsSection title={prodT('new')} tag='new' />
			<ProductsSection title={prodT('discount')} tag='discount' />
			<ProductsSection title={prodT('promotional')} tag='promotional' />
			<ProductsSection title={prodT('viewed')} tag='viewed' /> */}

			<SubscribeSection />
		</Flex>
	);
}
