import { Stack, Heading, Text } from '@chakra-ui/react';
import returnRefundData from '@/data/returnRefund';
import { type Metadata } from 'next';
import { getLocalizedMetadata } from '@/utils/i18nUtils';
import { getTranslations } from 'next-intl/server';

type Params = {
	params: { locale: string };
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
	const { locale } = await params;
	return getLocalizedMetadata(locale, 'returnRefund');
}

export default async function ReturnRefund() {
	const t = await getTranslations('Sidebar');

	return (
		<Stack gap={6} p={4} pt={1}>
			<Heading as='h1' size='3xl' fontWeight='normal' w='100%'>
				{t('returnRefund')}
			</Heading>

			<Text whiteSpace='pre-line'>{returnRefundData.content}</Text>
		</Stack>
	);
}
