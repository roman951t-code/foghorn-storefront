import { Stack, Heading, Text } from '@chakra-ui/react';
import privacyPolicy from '@/data/staticPages/privacyPolicy';
import { type Metadata } from 'next';
import { getLocalizedMetadata } from '@/utils/i18nUtils';
import { getTranslations } from 'next-intl/server';
import { LocaleParams } from '@/types/routing';
import { getPageBySlug } from '@/actions/content/getPageBySlug';
import { mergePageMetadata } from '@/utils/contentPage';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
	const { locale } = await params;
	const base = await getLocalizedMetadata(locale, 'privacyPolicy', { pathname: '/privacy-policy' });
	const page = await getPageBySlug('privacy-policy');
	return mergePageMetadata(base, page);
}

export default async function PrivacyPolicyPage() {
	const navigationT = await getTranslations('navigation');
	const page = await getPageBySlug('privacy-policy');
	const pageTitle = page?.title?.trim() || navigationT('sidebar.privacyPolicy');
	const content = page?.content ?? privacyPolicy.content;

	return (
		<Stack gap={6} p={4} pt={1}>
			<Heading as='h1' size='3xl' fontWeight='normal' w='100%'>
				{pageTitle}
			</Heading>
			<Text whiteSpace='pre-line'>{content}</Text>
		</Stack>
	);
}

