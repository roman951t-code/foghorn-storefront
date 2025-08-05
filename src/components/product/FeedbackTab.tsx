import { Card, Text, Flex, Stack, Heading, Separator, DataList } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { Rating } from '../reusable/chakra/rating';
import { Tooltip } from '../ui/tooltip';
import DateWithLocale from '../reusable/DateWithLocale';

const FeedbackModal = dynamic(() => import('./FeedbackModal'));

type Review = {
	rating: number;
	comment: string;
	createdAt: string | Date;
	user: {
		name: string;
		image?: string | null;
	};
};

type FeedbackTabProps = {
	reviews: Review[];
};

export default function FeedbackTab({ reviews }: FeedbackTabProps) {
	const authT = useTranslations('Auth');
	const genT = useTranslations('General');
	const prodT = useTranslations('Products');

	const i18nData = {
		name: authT('name'),
		email: authT('email'),
		rate: prodT('rate'),
		leaveFeedback: prodT('leaveFeedback'),
		myRate: prodT('myRate'),
		send: genT('send'),
	};

	const averageRating =
		reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;
	console.log('averageRating', averageRating);
	return (
		<Stack gap='4'>
			<Card.Root
				size='sm'
				minWidth='200px'
				w='100%'
				border='1px solid'
				borderColor='border.dark'
				bg='bg.tertiary'
			>
				<Card.Header p='4'>
					<Flex justifyContent='space-between' alignItems='center'>
						<Stack>
							<DataList.Root orientation='horizontal'>
								<DataList.Item>
									<DataList.ItemLabel fontSize='md' fontWeight='medium' color='main'>
										{reviews.length > 0 ? `${prodT('feedbackTotal')}:` : prodT('feedbackAbsent')}
									</DataList.ItemLabel>
									{reviews.length > 0 && (
										<DataList.ItemValue>
											<Heading size='md'>{reviews.length}</Heading>
										</DataList.ItemValue>
									)}
								</DataList.Item>
								{reviews.length > 0 && (
									<DataList.Item>
										<DataList.ItemLabel fontSize='md' fontWeight='medium' color='main'>
											{`${prodT('averageFeedback')}:`}
										</DataList.ItemLabel>

										<Tooltip
											content={`${averageRating}`}
											contentProps={{
												color: 'black',
												bg: 'bg.accent',
											}}
											positioning={{ placement: 'right-end' }}
											openDelay={100}
											closeDelay={100}
										>
											<DataList.ItemValue gapX='4' cursor='pointer'>
												<Rating
													size='xs'
													colorPalette={{ base: 'orange', _dark: 'yellow' }}
													readOnly
													allowHalf
													defaultValue={averageRating}
												/>
											</DataList.ItemValue>
										</Tooltip>
									</DataList.Item>
								)}
							</DataList.Root>
						</Stack>
						<FeedbackModal i18nData={i18nData} />
					</Flex>
				</Card.Header>
			</Card.Root>

			{reviews.map((review, idx) => (
				<Card.Root
					key={idx}
					size='sm'
					minWidth='200px'
					w='100%'
					border='1px solid'
					borderColor='border.dark'
					bg='bg.tertiary'
				>
					<Card.Header>
						<Flex justifyContent='space-between'>
							<Stack>
								<Heading size='md'>{review.user.name}</Heading>
								<Rating
									colorPalette={{ base: 'orange', _dark: 'yellow' }}
									readOnly
									size='xs'
									defaultValue={review.rating}
								/>
							</Stack>

							<DateWithLocale date={review.createdAt} />
						</Flex>
					</Card.Header>
					<Separator mt='4' color='border.dark' />
					<Card.Body color='main'>{review.comment}</Card.Body>
				</Card.Root>
			))}
		</Stack>
	);
}
