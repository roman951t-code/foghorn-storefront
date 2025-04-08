import { Stack, Heading, Text } from '@chakra-ui/react';
import shippingTermsData from '@/data/shippingTerms';
import { useTranslations } from 'next-intl';

export default function ShippingTerms() {
	const t = useTranslations('Sidebar');

	return (
		<Stack gap={6} p={4} pt={1}>
			<Heading as='h1' size='3xl' fontWeight='normal' w='100%'>
				{t('shippingTerms')}
			</Heading>
			<Text whiteSpace='pre-line'>{shippingTermsData.content}</Text>
		</Stack>
	);
}
