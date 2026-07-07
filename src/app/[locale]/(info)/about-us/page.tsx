import { Stack, Heading, Text } from '@chakra-ui/react';
import aboutData from '@/data/staticPages/about';
import { type Metadata } from 'next';
import { getLocalizedMetadata } from '@/utils/i18nServerUtils';
import { getTranslations } from 'next-intl/server';
import { LocaleParams } from '@/types/routing';
import { getPageBySlug } from '@/actions/content/getPageBySlug';
import { mergePageMetadata } from '@/utils/contentPage';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
	const { locale } = await params;
	const base = await getLocalizedMetadata(locale, 'aboutUs', { pathname: '/about-us' });
	const page = await getPageBySlug('about-us', locale);
	return mergePageMetadata(base, page);
}

export default async function AboutUs({ params }: LocaleParams) {
	const { locale } = await params;
	const navigationT = await getTranslations({ locale, namespace: 'navigation' });
	const page = await getPageBySlug('about-us', locale);
	const pageTitle = page?.title?.trim() || navigationT('sidebar.aboutUs');
	const content = page?.content ?? aboutData.content;

	return (
		<Stack gap={6} p={4} pt={1}>
			<Heading as='h1' size='3xl' fontWeight='medium' w='100%'>
				{pageTitle}
			</Heading>

			<Text whiteSpace='pre-line'>{content}</Text>
		</Stack>
	);
}
