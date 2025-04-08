import { Stack, Heading, Text } from '@chakra-ui/react';
import aboutData from '@/data/about';
import { useTranslations } from 'next-intl';

export default function AboutUs() {
	const t = useTranslations('Sidebar');

	return (
		<Stack gap={6} p={4} pt={1}>
			<Heading as='h1' size='3xl' fontWeight='normal' w='100%'>
				{t('aboutUs')}
			</Heading>

			<Text whiteSpace='pre-line'>{aboutData.content}</Text>
		</Stack>
	);
}
