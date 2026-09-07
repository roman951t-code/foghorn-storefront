import { Stack, Text } from '@chakra-ui/react';
import PageHeading from '@/components/ui/PageHeading';
import cookiePolicy from '@/data/staticPages/cookiePolicy';
import { type Metadata } from 'next';
import { getLocalizedMetadata } from '@/utils/i18nServerUtils';
import { getTranslations } from 'next-intl/server';
import { LocaleParams } from '@/types/routing';
import { getPageBySlug } from '@/actions/content/getPageBySlug';
import { mergePageMetadata } from '@/utils/contentPage';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
	const { locale } = await params;
	const base = await getLocalizedMetadata(locale, 'cookiePolicy', { pathname: '/cookie-policy' });
	const page = await getPageBySlug('cookie-policy', locale);
	return mergePageMetadata(base, page);
}

export default async function CookiePolicyPage({ params }: LocaleParams) {
	const { locale } = await params;
	const navigationT = await getTranslations({ locale, namespace: 'navigation' });
	const page = await getPageBySlug('cookie-policy', locale);
	const pageTitle = page?.title?.trim() || navigationT('sidebar.cookiePolicy');
	const content = page?.content ?? cookiePolicy.content;

	return (
		<Stack gap={6} p={4} pt={1}>
			<PageHeading size='3xl' w='100%'>{pageTitle}</PageHeading>
			<Text whiteSpace='pre-line'>{content}</Text>
		</Stack>
	);
}

