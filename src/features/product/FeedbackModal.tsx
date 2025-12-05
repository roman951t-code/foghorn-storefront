'use client';
import {
	Box,
	Center,
	Input,
	Heading,
	Fieldset,
	Field,
	RatingGroup,
	Textarea,
} from '@chakra-ui/react';
import { VscFeedback } from 'react-icons/vsc';
import CenteredModal from '@/components/ui/dialogs/CenteredModal';
import { Controller, useForm } from 'react-hook-form';
import { PrimaryButton, SecondaryButton } from '@/components/ui/buttons/ActionButton';
import { useMemo, useState } from 'react';
import Auth from '@/features/auth/Auth';
import { useSession } from '@/providers/SessionProvider';
import { createFeedbackSchema, FeedbackSchema } from 'formValidationSchemas/feedbackSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { showToaster } from '@/utils/toast';
import { toasterMessages } from '@/data/toasterMessages';
import { useReviews } from '@/hooks/useReviews';
import { useTranslations } from 'next-intl';
import { useReviewStore } from '@/stores/reviewStore';
import type { Review } from '@/types/product';

type Props = {
	productId?: string;
	initialReviews?: Review[];
	onSuccess?: (review: Review) => void;
};

export default function FeedbackModal({ productId, initialReviews, onSuccess }: Props) {
	const authT = useTranslations('auth');
	const prodT = useTranslations('products');
	const genT = useTranslations('common');
	const validT = useTranslations('validation');

	const { session } = useSession();
	const [isOpen, setIsOpen] = useState(false);
	const [isPending, setIsPending] = useState(false);

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
		formState: { errors },
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

	const handleModalChange = (nextOpen: boolean) => {
		setIsOpen(nextOpen);
		if (!nextOpen && productId) {
			clearActiveProduct(productId);
		}
	};

	const handleOpen = () => {
		if (productId) {
			setActiveProduct(productId);
			setReviews(productId, initialReviews ?? []);
		}
		setIsOpen(true);
	};

	const onSubmit = async (formData: FeedbackSchema) => {
		setIsPending(true);

		try {
			const { success, review } = await handleReviewAction(formData);

			if (!success) {
				showToaster('error', toasterMessages.reviewAddFailed(i18nData));
			} else {
				handleModalChange(false);
				if (review) {
					onSuccess?.(review);
				}
			}
		} catch (err) {
			showToaster('error', toasterMessages.reviewAddFailed(i18nData));
		} finally {
			setIsPending(false);
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
			<Box px={4} pt='0' borderRadius='md'>
				<form onSubmit={handleSubmit(onSubmit)}>
					<Center flexDirection='column' gap='4' mb='4'>
						<Heading size='3xl' fontWeight='normal'>
							{i18nData.rate}
						</Heading>
						<Controller
							control={control}
							name='rating'
							render={({ field }) => (
								<RatingGroup.Root
									cursor='pointer'
									defaultValue={5}
									name={field.name}
									value={field.value}
									onValueChange={({ value }) => field.onChange(value)}
								>
									<RatingGroup.Root
										size='lg'
										colorPalette={{ base: 'orange', _dark: 'yellow' }}
										allowHalf
										count={5}
										name={field.name}
										value={field.value}
										onValueChange={({ value }) => field.onChange(value)}
									>
										<RatingGroup.HiddenInput />
										<RatingGroup.Control />
									</RatingGroup.Root>
								</RatingGroup.Root>
							)}
						/>
					</Center>

					<Fieldset.Root size='lg' maxW='md'>
						<Fieldset.Content gap='6' maxH='580px' overflowY='auto'>
							<Field.Root invalid={!!errors.name} gap='2' justifyContent='center' required>
								<Field.Label maxH='20px'>
									{i18nData.name} <Field.RequiredIndicator />
								</Field.Label>

								<Input {...register('name')} variant='outline' size='md' />
								<Field.ErrorText alignSelf='flex-start'>
									{errors.name?.message?.toString()}
								</Field.ErrorText>
							</Field.Root>

							<Field.Root invalid={!!errors.lastName} gap='2' justifyContent='center' required>
								<Field.Label maxH='20px'>
									{i18nData.lastName} <Field.RequiredIndicator />
								</Field.Label>

								<Input {...register('lastName')} variant='outline' size='md' />
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

						<PrimaryButton w='100%' mt='8' type='submit' loading={isPending}>
							{i18nData.send}
						</PrimaryButton>
					</Fieldset.Root>
				</form>
			</Box>
		</CenteredModal>
	);
}
