import { Flex, Box } from '@chakra-ui/react';
import CatalogPanel from '@/features/catalog/CatalogPanel';
import ProductsSection from '@/features/catalog/ProductsSection';
import ViewedProductsSection from '@/features/catalog/ViewedProductsSection';
import SubscribeSection from '@/components/ui/sections/SubscribeSection';
import CatalogBtn from '@/components/ui/buttons/CatalogBtn';
import { extractI18nData, getLocalizedMetadata } from '@/utils/i18nUtils';
import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import {
	SUBSCRIBE_AUTH_KEYS,
	SUBSCRIBE_COMMON_KEYS,
	SUBSCRIBE_VALIDATION_KEYS,
} from '@/constants/subscribe';
import { LocaleParams } from '@/types/routing';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
	const { locale } = await params;
	return getLocalizedMetadata(locale, 'main', { pathname: '/' });
}

export const revalidate = 60;

export default async function Main() {
	const genT = await getTranslations('common');
	const prodT = await getTranslations('products');
	const authT = await getTranslations('auth');
	const validT = await getTranslations('validation');

	const i18nData = extractI18nData(genT, ['seeCategory', 'seeAll']);

	const subscribeI18nData = {
		...extractI18nData(genT, [...SUBSCRIBE_COMMON_KEYS]),
		...extractI18nData(authT, [...SUBSCRIBE_AUTH_KEYS]),
		...extractI18nData(validT, [...SUBSCRIBE_VALIDATION_KEYS]),
	};

	return (
		<Flex mx={{ base: '12px', '2xl': 0 }} direction='column'>
			<Box hideFrom='sm' mb='24px'>
				<CatalogBtn fullText />
			</Box>
			<CatalogPanel i18nData={i18nData} />
			<ProductsSection title={prodT('popular')} tag='popular' />
			<ProductsSection title={prodT('new')} tag='new' />
			{/*<ProductsSection title={prodT('discount')} tag='discount' />
			<ProductsSection title={prodT('promotional')} tag='promotional' /> */}
			<ViewedProductsSection title={prodT('viewed')} tag='viewed' />

			<SubscribeSection i18nData={subscribeI18nData} />
		</Flex>
	);
}
