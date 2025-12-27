import { Stack, Heading, Text } from '@chakra-ui/react';
import guaranteesData from '@/data/staticPages/guarantees';
import { type Metadata } from 'next';
import { getLocalizedMetadata } from '@/utils/i18nUtils';
import { getTranslations } from 'next-intl/server';
import { LocaleParams } from '@/types/routing';

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
	const { locale } = await params;
	return getLocalizedMetadata(locale, 'guarantee', { pathname: '/guarantee' });
}

export default async function Guarantees() {
	const navigationT = await getTranslations('navigation');

	return (
		<Stack gap={6} p={4} pt={1}>
			<Heading as='h1' size='3xl' fontWeight='normal' w='100%'>
				{navigationT('sidebar.guarantee')}
			</Heading>

			<Text whiteSpace='pre-line'>{guaranteesData.content}</Text>
		</Stack>
	);
}
