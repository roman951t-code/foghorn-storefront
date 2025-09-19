import { VStack, Heading } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import FeedbackCard from '@/components/reusable/cards/FeedbackCard';
import Pagination from '@/components/reusable/Pagination';

export default function Feedback() {
	const t = useTranslations('Sidebar');

	return (
		<VStack w='100%'>
			<Heading as='h2' size='2xl' fontWeight='normal' w='100%' mb='4'>
				{t('myFeedback')}
			</Heading>
			<FeedbackCard />
			<FeedbackCard feedback='fff' />
			<FeedbackCard />
			{/* <Pagination /> */}
		</VStack>
	);
}
