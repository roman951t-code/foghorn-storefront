import { Stack, Heading, Text } from '@chakra-ui/react';
import returnRefundData from '@/data/staticPages/returnRefund';
import { type Metadata } from 'next';
import { getLocalizedMetadata } from '@/utils/i18nUtils';
import { getTranslations } from 'next-intl/server';
import { LocaleParams } from '@/types/routing';
import { getPageBySlug } from '@/actions/content/getPageBySlug';
import { mergePageMetadata } from '@/utils/contentPage';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
	const { locale } = await params;
	const base = await getLocalizedMetadata(locale, 'returnRefund', { pathname: '/return-refund' });
	const page = await getPageBySlug('return-refund', locale);
	return mergePageMetadata(base, page);
}

export default async function ReturnRefund({ params }: LocaleParams) {
	const { locale } = await params;
	const navigationT = await getTranslations('navigation');
	const page = await getPageBySlug('return-refund', locale);
	const pageTitle = page?.title?.trim() || navigationT('sidebar.returnRefund');
	const content = page?.content ?? returnRefundData.content;

	return (
		<Stack gap={6} p={4} pt={1}>
			<Heading as='h1' size='3xl' fontWeight='medium' w='100%'>
				{pageTitle}
			</Heading>

			<Text whiteSpace='pre-line'>{content}</Text>
		</Stack>
	);
}
