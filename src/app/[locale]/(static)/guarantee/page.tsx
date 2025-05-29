import { Stack, Heading, Text } from '@chakra-ui/react';
import guaranteesData from '@/data/guarantees';
import { useTranslations } from 'next-intl';
import { type Metadata } from 'next';
import { getLocalizedMetadata } from '@/utils/i18nUtils';

type Params = {
	params: { locale: string };
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
	const { locale } = await params;
	return getLocalizedMetadata(locale, 'guarantee');
}

export default function Guarantees() {
	const t = useTranslations('Sidebar');

	return (
		<Stack gap={6} p={4} pt={1}>
			<Heading as='h1' size='3xl' fontWeight='normal' w='100%'>
				{t('guarantee')}
			</Heading>

			<Text whiteSpace='pre-line'>{guaranteesData.content}</Text>
		</Stack>
	);
}
