import { Card, Flex, Stack, Heading, Separator, DataList } from '@chakra-ui/react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { Rating } from '../reusable/chakra/rating';
import { Tooltip } from '../ui/tooltip';
import DateWithLocale from '../reusable/DateWithLocale';
import { extractI18nData } from '@/utils/i18nUtils';
import { authLocData, validLocData } from '@/data/localized';

const FeedbackModal = dynamic(() => import('./FeedbackModal'));

type Review = {
	id: string;
	rating: number;
	comment: string;
	advantages: string | null;
	disadvantages: string | null;
	createdAt: Date;
	user: { name: string; lastName: string | null };
};

type FeedbackTabProps = {
	reviews: Review[];
	productId: string;
};

export default function FeedbackTab({ reviews, productId }: FeedbackTabProps) {
	const authT = useTranslations('Auth');
	const genT = useTranslations('General');
	const prodT = useTranslations('Products');
	const validT = useTranslations('Validation');

	const authI18nData = extractI18nData(authT, authLocData);
	const validI18nData = extractI18nData(validT, validLocData);

	const i18nData = {
		...authI18nData,
		...validI18nData,
		authToOrder: authT('authToOrder'),
		authorize: authT('authorize'),
		yourContacts: authT('yourContacts'),
		name: authT('name'),
		rate: prodT('rate'),
		leaveFeedback: prodT('leaveFeedback'),
		myRate: prodT('myRate'),
		send: genT('send'),
		invalidFormData: validT('invalidFormData'),
		advantages: prodT('advantages'),
		disAdvantages: prodT('disAdvantages'),
		addReviewFail: validT('addReviewFail'),
		feedbackMinLength: validT('feedbackMinLength'),
		feedbackMaxLength: validT('feedbackMaxLength'),
	};

	const averageRating =
		reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;

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

						<FeedbackModal i18nData={i18nData} productId={productId} />
					</Flex>
				</Card.Header>
			</Card.Root>

			{reviews.map((review) => (
				<Card.Root
					key={review.id}
					size='sm'
					minWidth='200px'
					w='full'
					border='1px solid'
					borderColor='border.dark'
					bg='bg.tertiary'
				>
					<Card.Header>
						<Flex justifyContent='space-between'>
							<Stack>
								<Heading size='md'>{`${review.user.name} ${review.user.lastName ?? ''}`}</Heading>
								<Rating
									colorPalette={{ base: 'orange', _dark: 'yellow' }}
									readOnly
									allowHalf
									size='xs'
									defaultValue={review.rating}
								/>
							</Stack>

							<DateWithLocale date={review.createdAt} />
						</Flex>
					</Card.Header>
					<Separator mt='4' color='border.dark' />
					<Card.Body color='main'>
						<DataList.Root>
							{review.advantages && (
								<DataList.Item gap='2.5'>
									<DataList.ItemLabel fontSize='15px' fontWeight='medium' color='main'>
										{prodT('advantages')}
									</DataList.ItemLabel>
									<DataList.ItemValue fontSize='15px'>{review.advantages}</DataList.ItemValue>
								</DataList.Item>
							)}
							{review.disadvantages && (
								<DataList.Item gap='2.5'>
									<DataList.ItemLabel fontSize='15px' fontWeight='medium' color='main'>
										{prodT('disAdvantages')}
									</DataList.ItemLabel>
									<DataList.ItemValue fontSize='15px'>{review.disadvantages}</DataList.ItemValue>
								</DataList.Item>
							)}
							<DataList.Item gap='2.5'>
								<DataList.ItemLabel fontSize='15px' fontWeight='medium' color='main'>
									{prodT('comment')}
								</DataList.ItemLabel>
								<DataList.ItemValue fontSize='15px'>{review.comment}</DataList.ItemValue>
							</DataList.Item>
						</DataList.Root>
					</Card.Body>
				</Card.Root>
			))}
		</Stack>
	);
}
