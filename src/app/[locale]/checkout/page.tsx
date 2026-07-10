import { Flex, Group, Box } from '@chakra-ui/react';
import PageHeading from '@/components/ui/PageHeading';
import CheckoutSteps from './_components/CheckoutSteps';
import OrderInfo from './_components/OrderInfo';
import { type Metadata } from 'next';
import { getLocalizedMetadata } from '@/utils/i18nServerUtils';
import { getTranslations } from 'next-intl/server';
import { LocaleParams } from '@/types/routing';
import { getEnabledStorefrontForms } from '@/actions/storefront/getEnabledStorefrontForms';
import { StorefrontFormPlacement } from '@prisma/client';
import { STORE_CURRENCY_CODE } from '@/config/currency';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
	const { locale } = await params;
	return getLocalizedMetadata(locale, 'checkout', {
		pathname: '/checkout',
		robots: { index: false, follow: false },
	});
}

export default async function Checkout({ params }: LocaleParams) {
	const { locale } = await params;
	const productsT = await getTranslations({ locale, namespace: 'products' });
	const checkoutForms = await getEnabledStorefrontForms(StorefrontFormPlacement.CHECKOUT);

	return (
		<Flex mx={{ base: '12px', '2xl': 0 }} gap={8} direction='column'>
			<PageHeading mt='2' size='3xl'>
				{productsT('orderProcessing')}
			</PageHeading>
			<Group justifyContent='space-between' align='flex-start' gapX='4'>
				<Box as='section' flex='1'>
					<CheckoutSteps />
					<Box hideFrom='lg'>
						{<OrderInfo storefrontForms={checkoutForms} currencyCode={STORE_CURRENCY_CODE} />}
					</Box>
				</Box>
				<Box
					as='aside'
					w='360px'
					rounded='lg'
					bg='bg.tertiary'
					borderWidth='0.5px'
					borderStyle='solid'
					borderColor='border'
					hideBelow='lg'
					position='sticky'
					top='76px'
				>
					<OrderInfo storefrontForms={checkoutForms} currencyCode={STORE_CURRENCY_CODE} />
				</Box>
			</Group>
		</Flex>
	);
}
