import { Stack, List, Heading, Text } from '@chakra-ui/react';
import PageHeading from '@/components/ui/PageHeading';
import faqData from '@/data/staticPages/faq';
import { type Metadata } from 'next';
import { getLocalizedMetadata } from '@/utils/i18nServerUtils';
import { getTranslations } from 'next-intl/server';
import { LocaleParams } from '@/types/routing';
import { getPageBySlug } from '@/actions/content/getPageBySlug';
import { mergePageMetadata, parseFaqContent } from '@/utils/contentPage';
import JsonLd from '@/components/seo/JsonLd';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
	const { locale } = await params;
	const base = await getLocalizedMetadata(locale, 'faq', { pathname: '/faq' });
	const page = await getPageBySlug('faq', locale);
	return mergePageMetadata(base, page);
}

export default async function FAQ({ params }: LocaleParams) {
	const { locale } = await params;
	const navigationT = await getTranslations({ locale, namespace: 'navigation' });
	const page = await getPageBySlug('faq', locale);
	const pageTitle = page?.title?.trim() || navigationT('sidebar.faq');
	const parsedFaq = parseFaqContent(page?.content);
	const fallbackFaq = page?.content ? null : faqData[locale];
	const faqs = parsedFaq ?? fallbackFaq ?? [];

	const faqJsonLd =
		faqs.length > 0
			? {
					'@context': 'https://schema.org',
					'@type': 'FAQPage',
					mainEntity: faqs.map((item) => ({
						'@type': 'Question',
						name: item.question,
						acceptedAnswer: {
							'@type': 'Answer',
							text: item.answer,
						},
					})),
				}
			: null;

	return (
		<Stack gap={6} p={4} pt={1}>
			{faqJsonLd ? <JsonLd id='faq-schema' data={faqJsonLd} /> : null}
			<PageHeading size='3xl' w='100%'>{pageTitle}</PageHeading>

			{faqs.length > 0 ? (
				<List.Root gap='6' pl='4'>
					{faqs.map((item, index) => (
						<List.Item key={index}>
							<Heading as='h3' size='md'>
								{item.question}
							</Heading>
							<Text mt='2'>{item.answer}</Text>
						</List.Item>
					))}
				</List.Root>
			) : (
				<Text whiteSpace='pre-line'>{page?.content ?? ''}</Text>
			)}
		</Stack>
	);
}
