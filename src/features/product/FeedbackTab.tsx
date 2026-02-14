'use client';
import { Card, DataList, Flex, HStack, IconButton, Separator, Stack, Text } from '@chakra-ui/react';
import { Rating } from '@/components/ui/chakra/rating';
import { Tooltip } from '@/components/ui/tooltip';
import DateWithLocale from '@/components/ui/DateWithLocale';
import { useReviews, useInitReviews } from '@/hooks/useReviews';
import type { Review } from '@/types/product';
import { useTranslations } from 'next-intl';
import FeedbackModal from './FeedbackModal';
import { FiTrash2 } from 'react-icons/fi';
import { useSession } from '@/providers/SessionProvider';
import { showToaster } from '@/utils/toast';
import { toasterMessages } from '@/data/toasterMessages';
import CountPill from '@/components/ui/CountPill';

type Props = {
	deleteReviewFail: string;
	productId: string;
	reviews: Review[];
};

export default function FeedbackTab({ deleteReviewFail, productId, reviews }: Props) {
	useInitReviews(productId, reviews);
	const { reviews: storeReviews, handleRemoveAction } = useReviews();
	const { session } = useSession();
	const prodT = useTranslations('products');

	const userId = session?.user?.id;
	const userReview = userId ? storeReviews.find((r) => r.user.id === userId) : undefined;

	const reviewCount = storeReviews.length;
	const effectiveAverageRating =
		reviewCount > 0 ? storeReviews.reduce((acc, r) => acc + (r.rating ?? 0), 0) / reviewCount : 0;

	const onRemoveFeedback = async () => {
		try {
			const { success } = await handleRemoveAction();

			if (!success) {
				showToaster('error', toasterMessages.reviewDeleteFailed(deleteReviewFail));
			}
		} catch {
			showToaster('error', toasterMessages.reviewDeleteFailed(deleteReviewFail));
		}
	};

	return (
		<Stack gap='6' colorPalette='gray'>
			<Card.Root
				size='sm'
				minWidth='200px'
				w='100%'
				borderWidth='0.5px'
				borderStyle='solid'
				borderColor='border'
				bg='bg.tertiary'
				overflow='hidden'
			>
				<Card.Body p={{ base: '4', sm: '5' }}>
					<Flex justifyContent='space-between' alignItems='flex-start' gap='4' flexWrap='wrap'>
						<Stack gap='3' minW={{ base: '100%', sm: '320px' }}>
							<HStack gap='2' flexWrap='wrap'>
								<Text fontWeight='semibold' color='main'>
									{prodT('feedback')}
								</Text>
								<CountPill value={reviewCount} />
							</HStack>

							{reviewCount > 0 ? (
								<HStack gap='3' alignItems='center' flexWrap='wrap'>
									<Tooltip
										content={`${effectiveAverageRating.toFixed(2)}`}
										contentProps={{ color: 'black', bg: 'bg.accent' }}
										positioning={{ placement: 'right-end' }}
										openDelay={100}
										closeDelay={100}
									>
										<HStack gap='3' cursor='pointer'>
											<Text fontSize='3xl' fontWeight='bold' color='main'>
												{effectiveAverageRating.toFixed(1)}
											</Text>
											<Rating
												size='sm'
												colorPalette={{ base: 'orange', _dark: 'yellow' }}
												readOnly
												allowHalf
												value={effectiveAverageRating}
											/>
										</HStack>
									</Tooltip>
									<Text fontSize='sm' color='fg.muted'>
										{prodT('feedbackTotal')}: {reviewCount}
									</Text>
								</HStack>
							) : (
								<Text fontSize='sm' color='fg.muted'>
									{prodT('feedbackAbsent')}
								</Text>
							)}
						</Stack>

						<FeedbackModal productId={productId} initialReviews={userReview ? [userReview] : []} />
					</Flex>
				</Card.Body>
			</Card.Root>

			{storeReviews.map((review) => (
				<Card.Root
					key={review.id}
					size='sm'
					minWidth='200px'
					w='full'
					borderWidth='0.5px'
					borderStyle='solid'
					borderColor='border'
					bg='bg.tertiary'
				>
					<Card.Header>
						<Flex justifyContent='space-between'>
							<Stack gap='1.5'>
								<Text fontWeight='semibold' fontSize='md' color='main'>
									{`${review.user.name} ${review.user.lastName ?? ''}`}
								</Text>
								<Rating
									colorPalette={{ base: 'orange', _dark: 'yellow' }}
									readOnly
									allowHalf
									size='sm'
									defaultValue={review.rating}
								/>
							</Stack>

							<DateWithLocale date={review.createdAt} />
						</Flex>
					</Card.Header>
					<Separator mt='4' color='border' />
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
								aria-label='Delete review'
								variant='ghost'
								rounded='md'
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
