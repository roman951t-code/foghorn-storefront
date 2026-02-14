'use client';
import { Box, Input, Fieldset, Field, Textarea, Card, Flex, Stack, Text } from '@chakra-ui/react';
import { VscFeedback } from 'react-icons/vsc';
import CenteredModal from '@/components/ui/dialogs/CenteredModal';
import { Controller, useForm } from 'react-hook-form';
import { PrimaryButton, SecondaryButton } from '@/components/ui/buttons/ActionButton';
import { useMemo, useRef, useState } from 'react';
import Auth from '@/features/auth/Auth';
import { useSession } from '@/providers/SessionProvider';
import { createFeedbackSchema, FeedbackSchema } from 'validationSchemas/feedbackSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { showToaster } from '@/utils/toast';
import { toasterMessages } from '@/data/toasterMessages';
import { useReviews } from '@/hooks/useReviews';
import { useTranslations } from 'next-intl';
import { useReviewStore } from '@/stores/reviewStore';
import type { Review } from '@/types/product';
import { Rating } from '@/components/ui/chakra/rating';

type Props = {
	productId?: string;
	initialReviews?: Review[];
	onSuccessAction?: (review: Review) => void;
};

export default function FeedbackModal({ productId, initialReviews, onSuccessAction }: Props) {
	const authT = useTranslations('auth');
	const prodT = useTranslations('products');
	const genT = useTranslations('common');
	const validT = useTranslations('validation');

	const { session } = useSession();
	const [isOpen, setIsOpen] = useState(false);
	const didSetActiveProductRef = useRef(false);

	const { handleReviewAction } = useReviews();
	const setActiveProduct = useReviewStore((state) => state.setActiveProduct);
	const setReviews = useReviewStore((state) => state.setReviews);
	const clearActiveProduct = useReviewStore((state) => state.clearActiveProduct);

	const i18nData = useMemo(
		() => ({
			name: authT('name'),
			lastName: authT('lastName'),
			email: authT('email'),
			rate: prodT('rate'),
			advantages: prodT('advantages'),
			disAdvantages: prodT('disAdvantages'),
			leaveFeedback: prodT('leaveFeedback'),
			myRate: prodT('myRate'),
			invalidFormData: validT('invalidFormData'),
			send: genT('send'),
			feedbackMinLength: validT('feedbackMinLength'),
			feedbackMaxLength: validT('feedbackMaxLength'),
		}),
		[authT, genT, prodT, validT]
	);

	const schema = useMemo(() => createFeedbackSchema(i18nData), [i18nData]);

	const {
		register,
		handleSubmit,
		control,
		reset,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<FeedbackSchema>({
		mode: 'all',
		resolver: zodResolver(schema),
		defaultValues: {
			name: session?.user?.name || '',
			lastName: session?.user?.lastName || '',
			feedback: initialReviews?.[0]?.comment ?? '',
			advantages: initialReviews?.[0]?.advantages ?? '',
			disAdvantages: initialReviews?.[0]?.disadvantages ?? '',
			rating: initialReviews?.[0]?.rating ?? 4.5,
		},
	});

	const ratingValue = watch('rating') ?? 0;

	const handleModalChange = (nextOpen: boolean) => {
		setIsOpen(nextOpen);
		if (!nextOpen && productId && didSetActiveProductRef.current) {
			clearActiveProduct(productId);
			didSetActiveProductRef.current = false;
		}
	};

	const handleOpen = () => {
		if (productId) {
			const state = useReviewStore.getState();
			if (state.activeProductId !== productId) {
				setActiveProduct(productId);
				didSetActiveProductRef.current = true;
			}

			// Avoid overwriting an already-initialized reviews list (e.g. on product page),
			// otherwise the UI can "lose" reviews until a full reload.
			if (!state.reviewsByProduct[productId]) {
				setReviews(productId, initialReviews ?? []);
			}
		}
		setIsOpen(true);
	};

	const onSubmit = async (formData: FeedbackSchema) => {
		try {
			const { success, review } = await handleReviewAction(formData);

			if (!success) {
				showToaster('error', toasterMessages.reviewAddFailed(i18nData));
			} else {
				handleModalChange(false);
				if (review) {
					onSuccessAction?.(review);
				}
			}

			reset();
		} catch (err) {
			showToaster('error', toasterMessages.reviewAddFailed(i18nData));
		}
	};

	if (!session?.session) {
		return (
			<Auth
				trigger={
					<SecondaryButton onClick={handleOpen}>
						<VscFeedback /> {i18nData.leaveFeedback}
					</SecondaryButton>
				}
			/>
		);
	}

	return (
		<CenteredModal
			dialogId='feedback-modal'
			open={isOpen}
			setIsOpen={handleModalChange}
			title={i18nData.leaveFeedback}
			trigger={
				<SecondaryButton onClick={handleOpen}>
					<VscFeedback /> {i18nData.leaveFeedback}
				</SecondaryButton>
			}
			size='md'
		>
			<Box px={4} pt='0' borderRadius='lg'>
				<form onSubmit={handleSubmit(onSubmit)}>
					<Card.Root
						borderWidth='0.5px'
						borderStyle='solid'
						borderColor='border'
						bg='bg.tertiary'
						boxShadow='none'
					>
						<Card.Body p='4'>
							<Flex justifyContent='space-between' alignItems='center' gap='4' flexWrap='wrap'>
								<Stack fontSize='md' gapY='2.5'>
									<Text fontWeight='semibold' color='main'>
										{prodT('rate')}
									</Text>
									<Text color='fg.muted'>
										{Number.isFinite(ratingValue) ? ratingValue : '0.0'} / 5
									</Text>
								</Stack>
								<Controller
									control={control}
									name='rating'
									render={({ field }) => (
										<Rating
											cursor='pointer'
											size='lg'
											allowHalf
											count={5}
											name={field.name}
											value={field.value}
											onValueChange={({ value }) => field.onChange(value)}
											colorPalette={{ base: 'orange', _dark: 'yellow' }}
										/>
									)}
								/>
							</Flex>
						</Card.Body>
					</Card.Root>

					<Fieldset.Root size='lg' maxW='md' mt='6'>
						<Fieldset.Content gap='6' maxH='580px' overflowY='auto'>
							<Field.Root invalid={!!errors.name} gap='2' justifyContent='center' required>
								<Field.Label maxH='20px'>
									{i18nData.name} <Field.RequiredIndicator />
								</Field.Label>

								<Input {...register('name')} size='md' />
								<Field.ErrorText alignSelf='flex-start'>
									{errors.name?.message?.toString()}
								</Field.ErrorText>
							</Field.Root>

							<Field.Root invalid={!!errors.lastName} gap='2' justifyContent='center' required>
								<Field.Label maxH='20px'>
									{i18nData.lastName} <Field.RequiredIndicator />
								</Field.Label>

								<Input {...register('lastName')} size='md' />
								<Field.ErrorText alignSelf='flex-start'>
									{errors.lastName?.message?.toString()}
								</Field.ErrorText>
							</Field.Root>

							<Field.Root invalid={!!errors.advantages} gap='2' justifyContent='center'>
								<Field.Label maxH='20px'>{i18nData.advantages}</Field.Label>

								<Textarea minH='80px' maxH='300px' {...register('advantages')} />
								<Field.ErrorText alignSelf='flex-start'>
									{errors.advantages?.message?.toString()}
								</Field.ErrorText>
							</Field.Root>

							<Field.Root invalid={!!errors.disAdvantages} gap='2' justifyContent='center'>
								<Field.Label maxH='20px'>{i18nData.disAdvantages}</Field.Label>

								<Textarea minH='80px' maxH='300px' {...register('disAdvantages')} />
								<Field.ErrorText alignSelf='flex-start'>
									{errors.disAdvantages?.message?.toString()}
								</Field.ErrorText>
							</Field.Root>

							<Field.Root invalid={!!errors.feedback} gap='2' justifyContent='center' required>
								<Field.Label maxH='20px'>
									{i18nData.myRate} <Field.RequiredIndicator />
								</Field.Label>

								<Textarea
									minH='80px'
									maxH='300px'
									{...register('feedback', { required: i18nData.myRate + ' is required' })}
								/>
								<Field.ErrorText alignSelf='flex-start'>
									{errors.feedback?.message?.toString()}
								</Field.ErrorText>
							</Field.Root>
						</Fieldset.Content>

						<PrimaryButton
							w='100%'
							mt='8'
							type='submit'
							loading={isSubmitting}
							disabled={isSubmitting}
						>
							{i18nData.send}
						</PrimaryButton>
					</Fieldset.Root>
				</form>
			</Box>
		</CenteredModal>
	);
}
