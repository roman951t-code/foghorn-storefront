import { Stack, Heading, Text } from '@chakra-ui/react';
import privacyPolicy from '@/data/staticPages/privacyPolicy';
import { type Metadata } from 'next';
import { getLocalizedMetadata } from '@/utils/i18nServerUtils';
import { getTranslations } from 'next-intl/server';
import { LocaleParams } from '@/types/routing';
import { getPageBySlug } from '@/actions/content/getPageBySlug';
import { mergePageMetadata } from '@/utils/contentPage';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
	const { locale } = await params;
	const base = await getLocalizedMetadata(locale, 'privacyPolicy', { pathname: '/privacy-policy' });
	const page = await getPageBySlug('privacy-policy', locale);
	return mergePageMetadata(base, page);
}

export default async function PrivacyPolicyPage({ params }: LocaleParams) {
	const { locale } = await params;
	const navigationT = await getTranslations({ locale, namespace: 'navigation' });
	const page = await getPageBySlug('privacy-policy', locale);
	const pageTitle = page?.title?.trim() || navigationT('sidebar.privacyPolicy');
	const content = page?.content ?? privacyPolicy.content;

	return (
		<Stack gap={6} p={4} pt={1}>
			<Heading as='h1' size='3xl' fontWeight='medium' w='100%'>
				{pageTitle}
			</Heading>
			<Text whiteSpace='pre-line'>{content}</Text>
		</Stack>
	);
}

