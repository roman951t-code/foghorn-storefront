import { Stack, Heading, Text } from '@chakra-ui/react';
import publicOfferData from '@/data/staticPages/publicOffer';
import { type Metadata } from 'next';
import { getLocalizedMetadata } from '@/utils/i18nUtils';
import { getTranslations } from 'next-intl/server';
import { LocaleParams } from '@/types/routing';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
	const { locale } = await params;
	return getLocalizedMetadata(locale, 'publicOffer', { pathname: '/public-offer' });
}

export default async function PublicOffer() {
	const navigationT = await getTranslations('navigation');

	return (
		<Stack gap={6} p={4} pt={1}>
			<Heading as='h1' size='3xl' fontWeight='normal' w='100%'>
				{navigationT('sidebar.publicOffer')}
			</Heading>

			<Text whiteSpace='pre-line'>{publicOfferData.content}</Text>
		</Stack>
	);
}
