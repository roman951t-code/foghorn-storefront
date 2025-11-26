'use client';
import { Card, Flex, Stack, Heading, Separator, DataList, IconButton } from '@chakra-ui/react';
import { Rating } from '../reusable/chakra/rating';
import { Tooltip } from '../ui/tooltip';
import DateWithLocale from '../reusable/DateWithLocale';
import { useReviews, useInitReviews } from '../providers/useReviews';
import { I18nData } from '@/types/i18n';
import type { Review } from '@/types/product';
import { useTranslations } from 'next-intl';
import FeedbackModal from './FeedbackModal';
import { FiTrash2 } from 'react-icons/fi';
import { useSession } from '../providers/SessionProvider';
import { toaster } from '../reusable/chakra/toaster';

type Props = {
	averageRating: number;
	i18nData: I18nData;
	deleteReviewFail: string;
	productId: string;
	reviews: Review[];
};

export default function FeedbackTab({
	i18nData,
	averageRating,
	deleteReviewFail,
	productId,
	reviews,
}: Props) {
	useInitReviews(productId, reviews);
	const { reviews: storeReviews, handleRemoveAction } = useReviews();
	const { session } = useSession();
	const prodT = useTranslations('products');

	const userId = session?.user?.id;

	const onRemoveFeedback = async () => {
		try {
			const { success } = await handleRemoveAction();

			if (!success) {
				toaster.error({ title: deleteReviewFail, duration: 5000 });
			}
		} catch {
			toaster.error({ title: deleteReviewFail, duration: 5000 });
		}
	};

	return (
		<Stack gap='4' colorPalette='gray'>
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
										{storeReviews.length > 0
											? `${prodT('feedbackTotal')}:`
											: prodT('feedbackAbsent')}
									</DataList.ItemLabel>
									{storeReviews.length > 0 && (
										<DataList.ItemValue>
											<Heading size='md'>{storeReviews.length}</Heading>
										</DataList.ItemValue>
									)}
								</DataList.Item>
								{storeReviews.length > 0 && (
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

			{storeReviews.map((review) => (
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
					<Card.Body color='main' flexDirection='row'>
						<DataList.Root flex='1'>
							{review.advantages && (
								<DataList.Item gap='2.5'>
									<DataList.ItemLabel fontSize='15px' fontWeight='medium' color='main'>
										{prodT('advantages')}
									</DataList.ItemLabel>
									<DataList.ItemValue fontSize='15px' wordBreak='break-word'>
										{review.advantages}
									</DataList.ItemValue>
								</DataList.Item>
							)}
							{review.disadvantages && (
								<DataList.Item gap='2.5'>
									<DataList.ItemLabel fontSize='15px' fontWeight='medium' color='main'>
										{prodT('disAdvantages')}
									</DataList.ItemLabel>
									<DataList.ItemValue fontSize='15px' wordBreak='break-word'>
										{review.disadvantages}
									</DataList.ItemValue>
								</DataList.Item>
							)}
							<DataList.Item gap='2.5'>
								<DataList.ItemLabel fontSize='15px' fontWeight='medium' color='main'>
									{prodT('comment')}
								</DataList.ItemLabel>
								<DataList.ItemValue fontSize='15px' wordBreak='break-word'>
									{review.comment}
								</DataList.ItemValue>
							</DataList.Item>
						</DataList.Root>

						{userId === review.user.id && (
							<IconButton
								onClick={onRemoveFeedback}
								alignSelf='flex-end'
								justifySelf='flex-end'
								aria-label='Trash'
								variant='ghost'
								rounded='full'
								color='main.disabled'
								transition='all 0.2s ease-in-out'
								_hover={{
									bg: 'colorPalette.500',
									color: 'main.lightOnly',
								}}
							>
								<FiTrash2 />
							</IconButton>
						)}
					</Card.Body>
				</Card.Root>
			))}
		</Stack>
	);
}
