import { Stack, Heading, Text } from '@chakra-ui/react';
import terms from '@/data/terms';
import { useTranslations } from 'next-intl';
import { type Metadata } from 'next';
import { getLocalizedMetadata } from '@/utils/i18nUtils';

type Params = {
	params: { locale: string };
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
	const { locale } = await params;
	return getLocalizedMetadata(locale, 'terms');
}

export default function ShippingTerms() {
	const t = useTranslations('Sidebar');

	return (
		<Stack gap={6} p={4} pt={1}>
			<Heading as='h1' size='3xl' fontWeight='normal' w='100%'>
				{t('terms')}
			</Heading>
			<Text whiteSpace='pre-line'>{terms.content}</Text>
		</Stack>
	);
}
