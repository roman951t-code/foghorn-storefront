import { Flex, Box } from '@chakra-ui/react';
import CatalogPanel from '@/features/catalog/CatalogPanel';
import ProductsSection from '@/features/catalog/ProductsSection';
import SubscribeSection from '@/components/ui/sections/SubscribeSection';
import CatalogBtn from '@/components/ui/buttons/CatalogBtn';
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
	const genT = await getTranslations('common');
	const prodT = await getTranslations('products');
	const authT = await getTranslations('auth');
	const validT = await getTranslations('validation');

	const i18nData = extractI18nData(genT, ['seeCategory', 'seeAll']);

	const subscribeI18nData = {
		subscribeInfo: genT('subscribeInfo'),
		email: authT('email'),
		verifyEmail: authT('verifyEmail'),
		subscribeProcedure: genT('subscribeProcedure'),
		emailConfirmation: authT('emailConfirmation'),
		toPost: authT('toPost'),
		signUpCodeSent: authT('signUpCodeSent'),
		confirmEmail: authT('confirmEmail'),
		resendAfter: authT('resendAfter'),
		resendCode: authT('resendCode'),
		emailUpdated: authT('emailUpdated'),
		emailNotVerifiedError: validT('emailNotVerifiedError'),
		subscribe: genT('subscribe'),
		subscribed: genT('subscribed'),
		unsubscribe: genT('unsubscribe'),
		subscribeFail: validT('subscribeFail'),
		subscribedSuccessfully: genT('subscribedSuccessfully'),
		unsubscribedSuccessfully: genT('unsubscribedSuccessfully'),
		editEmailFail: validT('editEmailFail'),
		invalidFormData: validT('invalidFormData'),
		unsubscribeFail: validT('unsubscribeFail'),
		emailRequired: validT('emailRequired'),
		inputMaxLength: validT('inputMaxLength'),
		wrongEmail: validT('wrongEmail'),
	};

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

			<SubscribeSection i18nData={subscribeI18nData} />
		</Flex>
	);
}
