import { Stack, List, Heading, Text } from '@chakra-ui/react';
import faqData from '@/data/staticPages/faq';
import { type Metadata } from 'next';
import { getLocalizedMetadata } from '@/utils/i18nUtils';
import { getTranslations } from 'next-intl/server';
import { LocaleParams } from '@/types/routing';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
	const { locale } = await params;
	return getLocalizedMetadata(locale, 'faq', { pathname: '/faq' });
}

const faqs = faqData;

export default async function FAQ() {
	const t = await getTranslations('navigation');

	return (
		<Stack gap={6} p={4} pt={1}>
			<Heading as='h1' size='3xl' fontWeight='normal' w='100%'>
				{t('sidebar.faq')}
			</Heading>

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
		</Stack>
	);
}
