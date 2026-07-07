import { Stack, Heading, Text } from '@chakra-ui/react';
import guaranteesData from '@/data/staticPages/guarantees';
import { type Metadata } from 'next';
import { getLocalizedMetadata } from '@/utils/i18nServerUtils';
import { getTranslations } from 'next-intl/server';
import { LocaleParams } from '@/types/routing';
import { getPageBySlug } from '@/actions/content/getPageBySlug';
import { mergePageMetadata } from '@/utils/contentPage';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
	const { locale } = await params;
	const base = await getLocalizedMetadata(locale, 'guarantee', { pathname: '/guarantee' });
	const page = await getPageBySlug('guarantee', locale);
	return mergePageMetadata(base, page);
}

export default async function Guarantees({ params }: LocaleParams) {
	const { locale } = await params;
	const navigationT = await getTranslations({ locale, namespace: 'navigation' });
	const page = await getPageBySlug('guarantee', locale);
	const pageTitle = page?.title?.trim() || navigationT('sidebar.guarantee');
	const content = page?.content ?? guaranteesData.content;

	return (
		<Stack gap={6} p={4} pt={1}>
			<Heading as='h1' size='3xl' fontWeight='medium' w='100%'>
				{pageTitle}
			</Heading>

			<Text whiteSpace='pre-line'>{content}</Text>
		</Stack>
	);
}
