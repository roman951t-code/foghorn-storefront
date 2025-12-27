import { Stack, Heading, Text } from '@chakra-ui/react';
import shippingTermsData from '@/data/staticPages/shippingTerms';
import { type Metadata } from 'next';
import { getLocalizedMetadata } from '@/utils/i18nUtils';
import { getTranslations } from 'next-intl/server';
import { LocaleParams } from '@/types/routing';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
	const { locale } = await params;
	return getLocalizedMetadata(locale, 'shippingTerms', { pathname: '/shipping-terms' });
}

export default async function ShippingTerms() {
	const navigationT = await getTranslations('navigation');

	return (
		<Stack gap={6} p={4} pt={1}>
			<Heading as='h1' size='3xl' fontWeight='normal' w='100%'>
				{navigationT('sidebar.shippingTerms')}
			</Heading>
			<Text whiteSpace='pre-line'>{shippingTermsData.content}</Text>
		</Stack>
	);
}
