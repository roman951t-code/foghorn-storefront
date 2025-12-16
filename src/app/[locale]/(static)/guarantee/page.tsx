import { Stack, Heading, Text } from '@chakra-ui/react';
import guaranteesData from '@/data/staticPages/guarantees';
import { type Metadata } from 'next';
import { getLocalizedMetadata } from '@/utils/i18nUtils';
import { getTranslations } from 'next-intl/server';

type Params = {
	params: { locale: string };
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
	const { locale } = await params;
	return getLocalizedMetadata(locale, 'guarantee', { pathname: '/guarantee' });
}

export default async function Guarantees() {
	const t = await getTranslations('navigation');

	return (
		<Stack gap={6} p={4} pt={1}>
			<Heading as='h1' size='3xl' fontWeight='normal' w='100%'>
				{t('sidebar.guarantee')}
			</Heading>

			<Text whiteSpace='pre-line'>{guaranteesData.content}</Text>
		</Stack>
	);
}
