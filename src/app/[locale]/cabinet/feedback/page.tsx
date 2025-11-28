import { VStack, Heading } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import FeedbackCard from '@/components/feedback/FeedbackCard';

export default function Feedback() {
	const t = useTranslations('navigation');

	return (
		<VStack w='100%'>
			<Heading as='h2' size='2xl' fontWeight='normal' w='100%' mb='4'>
				{t('sidebar.myFeedback')}
			</Heading>
			<FeedbackCard />
			<FeedbackCard feedback='fff' />
			<FeedbackCard />
		</VStack>
	);
}
