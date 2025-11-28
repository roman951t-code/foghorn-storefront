import { Flex, Group, Box, Heading } from '@chakra-ui/react';
import CheckoutSteps from './_components/CheckoutSteps';
import OrderInfo from './_components/OrderInfo';
import { type Metadata } from 'next';
import { getLocalizedMetadata } from '@/utils/i18nUtils';
import { getTranslations } from 'next-intl/server';

type Params = {
	params: { locale: string };
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
	const { locale } = await params;
	return getLocalizedMetadata(locale, 'checkout');
}

export default async function Checkout() {
	const t = await getTranslations('products');

	return (
		<Flex mx={{ base: '12px', '2xl': 0 }} gap={8} direction='column'>
			<Heading as='h1' size='4xl' fontWeight='normal'>
				{t('orderProcessing')}
			</Heading>
			<Group justifyContent='space-between' align='flex-start' gap='4'>
				<Box as='section' w={{ base: '100%', lg: '75%' }}>
					<CheckoutSteps />
					<Box hideFrom='lg'>{<OrderInfo />}</Box>
				</Box>
				<Box
					as='aside'
					w='25%'
					minW='304px'
					bg='bg.tertiary'
					rounded='sm'
					hideBelow='lg'
					position='sticky'
					top='74px'
				>
					<OrderInfo />
				</Box>
			</Group>
		</Flex>
	);
}
