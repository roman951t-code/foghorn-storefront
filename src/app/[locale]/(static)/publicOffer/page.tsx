import { Stack, Heading, Text } from '@chakra-ui/react';
import publicOfferData from '@/data/publicOffer';
import { useTranslations } from 'next-intl';
import { type Metadata } from 'next';
import { getLocalizedMetadata } from '@/utils/i18nUtils';

type Params = {
	params: { locale: string };
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
	const { locale } = await params;
	return getLocalizedMetadata(locale, 'publicOffer');
}

export default function PublicOffer() {
	const t = useTranslations('Sidebar');

	return (
		<Stack gap={6} p={4} pt={1}>
			<Heading as='h1' size='3xl' fontWeight='normal' w='100%'>
				{t('publicOffer')}
			</Heading>

			<Text whiteSpace='pre-line'>{publicOfferData.content}</Text>
		</Stack>
	);
}
