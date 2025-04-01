import { VStack, Heading } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';

export default function Chat() {
	const t = useTranslations('Sidebar');

	return (
		<VStack mt='4' w='100%' pr='3'>
			<Heading as='h2' size='2xl' fontWeight='normal' w='100%'>
				{t('chat')}
			</Heading>
		</VStack>
	);
}
