import { Flex, Group, Box, Heading } from '@chakra-ui/react';
import CheckoutSteps from './_components/CheckoutSteps';
import OrderInfo from './_components/OrderInfo';
import { type Metadata } from 'next';
import { getLocalizedMetadata } from '@/utils/i18nUtils';
import { getTranslations } from 'next-intl/server';
import { LocaleParams } from '@/types/routing';
import { getEnabledStorefrontForms } from '@/actions/storefront/getEnabledStorefrontForms';
import { StorefrontFormPlacement } from '@prisma/client';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
	const { locale } = await params;
	return getLocalizedMetadata(locale, 'checkout', {
		pathname: '/checkout',
		robots: { index: false, follow: false },
	});
}

export default async function Checkout() {
	const productsT = await getTranslations('products');
	const checkoutForms = await getEnabledStorefrontForms(StorefrontFormPlacement.CHECKOUT);

	return (
		<Flex mx={{ base: '12px', '2xl': 0 }} gap={8} direction='column'>
			<Heading as='h1' size='4xl' fontWeight='normal'>
				{productsT('orderProcessing')}
			</Heading>
			<Group justifyContent='space-between' align='flex-start' gapX='6'>
				<Box as='section' w={{ base: '100%', lg: '73%' }}>
					<CheckoutSteps />
					<Box hideFrom='lg'>{<OrderInfo storefrontForms={checkoutForms} />}</Box>
				</Box>
				<Box
					as='aside'
					w='27%'
					minW='324px'
					rounded='sm'
					bg='bg.tertiary'
					borderWidth='0.5px'
					borderStyle='solid'
					borderColor='border'
					hideBelow='lg'
					position='sticky'
					top='76px'
				>
					<OrderInfo storefrontForms={checkoutForms} />
				</Box>
			</Group>
		</Flex>
	);
}
