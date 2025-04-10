import { VStack, Heading } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import ChatCard from '@/components/reusable/cards/ChatCard';

export default function Chat() {
	const t = useTranslations('Sidebar');
	const genT = useTranslations('General');
	const prodT = useTranslations('Products');

	return (
		<VStack w='100%'>
			<Heading as='h2' size='2xl' fontWeight='normal' w='100%'>
				{t('chat')}
			</Heading>
			<VStack mt='6' w='100%'>
				<ChatCard
					productNumText={prodT('product')}
					sendText={genT('send')}
					inputPlaceholder={genT('enterYourQuestion')}
				/>
			</VStack>
		</VStack>
	);
}
