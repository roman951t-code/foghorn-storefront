import { Stack, List, Heading, Text } from '@chakra-ui/react';
import faqData from '@/data/faq';
import { useTranslations } from 'next-intl';

const faqs = faqData;

export default function FAQ() {
	const t = useTranslations('Sidebar');

	return (
		<Stack gap={6} p={4} pt={1}>
			<Heading as='h1' size='3xl' fontWeight='normal' w='100%'>
				{t('faq')}
			</Heading>

			<List.Root gap='6'>
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
