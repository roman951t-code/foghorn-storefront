import { Stack, Heading, Text } from '@chakra-ui/react';
import publicOfferData from '@/data/staticPages/publicOffer';
import { type Metadata } from 'next';
import { getLocalizedMetadata } from '@/utils/i18nUtils';
import { getTranslations } from 'next-intl/server';
import { LocaleParams } from '@/types/routing';
import { getPageBySlug } from '@/actions/content/getPageBySlug';
import { mergePageMetadata } from '@/utils/contentPage';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
	const { locale } = await params;
	const base = await getLocalizedMetadata(locale, 'publicOffer', { pathname: '/public-offer' });
	const page = await getPageBySlug('public-offer');
	return mergePageMetadata(base, page);
}

export default async function PublicOffer() {
	const navigationT = await getTranslations('navigation');
	const page = await getPageBySlug('public-offer');
	const pageTitle = page?.title?.trim() || navigationT('sidebar.publicOffer');
	const content = page?.content ?? publicOfferData.content;

	return (
		<Stack gap={6} p={4} pt={1}>
			<Heading as='h1' size='3xl' fontWeight='normal' w='100%'>
				{pageTitle}
			</Heading>

			<Text whiteSpace='pre-line'>{content}</Text>
		</Stack>
	);
}
