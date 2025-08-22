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
import CenteredModal from '@/components/dialogs/CenteredModal';
import { Controller, useForm } from 'react-hook-form';
import type { I18nData } from '@/types/i18n';
import { PrimaryButton, SecondaryButton } from '../reusable/buttons/ActionButton';
import { useMemo, useState } from 'react';
import Auth from '../auth/Auth';
import { useSession } from '../providers/SessionProvider';
import { createFeedbackSchema, FeedbackSchema } from 'formValidationSchemas/feedbackSchema';
import { zodResolver } from '@hookform/resolvers/zod';

interface Props {
	i18nData: I18nData;
}

export default function FeedbackModal({ i18nData }: Props) {
	const { session } = useSession();
	const [isOpen, setIsOpen] = useState(false);
	const [isPending, setIsPending] = useState(false);
	const [verifyError, setVerifyError] = useState('');

	const schema = useMemo(() => createFeedbackSchema(i18nData), [i18nData]);

	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
	} = useForm<FeedbackSchema>({
		mode: 'onSubmit',
		resolver: zodResolver(schema),
		defaultValues: {
			name: session?.session?.user?.name || '',
			lastName: session?.session?.user?.lastName || '',
			feedback: '',
			advantages: '',
			disAdvantages: '',
			rating: 5,
		},
	});

	const onSubmit = async (formData: FeedbackSchema) => {
		console.log('formData', formData);
		setIsPending(true);

		try {
		} catch (err) {
			setVerifyError(i18nData.invalidFormData);
		} finally {
			setIsPending(false);
		}
	};

	if (!session?.session) {
		return (
			<Auth
				i18nData={i18nData}
				trigger={
					<SecondaryButton>
						<VscFeedback /> {i18nData.leaveFeedback}
					</SecondaryButton>
				}
			/>
		);
	}

	return (
		<CenteredModal
			open={isOpen}
			setIsOpen={setIsOpen}
			title={i18nData.leaveFeedback}
			trigger={
				<SecondaryButton>
					<VscFeedback /> {i18nData.leaveFeedback}
				</SecondaryButton>
			}
			size='md'
		>
			<Box p={4} borderRadius='lg' mx='auto'>
				<form onSubmit={handleSubmit(onSubmit)}>
					<Center flexDirection='column' gap='4' mb='6'>
						<Heading size='3xl' fontWeight='normal'>
							{i18nData.rate}
						</Heading>
						<Controller
							control={control}
							name='rating'
							render={({ field }) => (
								<RatingGroup.Root
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
						<Fieldset.Content gap='6'>
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

								<Input {...register('advantages')} variant='outline' size='md' />
								<Field.ErrorText alignSelf='flex-start'>
									{errors.advantages?.message?.toString()}
								</Field.ErrorText>
							</Field.Root>

							<Field.Root invalid={!!errors.disAdvantages} gap='2' justifyContent='center'>
								<Field.Label maxH='20px'>{i18nData.disAdvantages}</Field.Label>

								<Input {...register('disAdvantages')} variant='outline' size='md' />
								<Field.ErrorText alignSelf='flex-start'>
									{errors.disAdvantages?.message?.toString()}
								</Field.ErrorText>
							</Field.Root>

							<Field.Root invalid={!!errors.lastName} gap='2' justifyContent='center' required>
								<Field.Label maxH='20px'>
									{i18nData.myRate} <Field.RequiredIndicator />
								</Field.Label>

								<Textarea
									minH='100px'
									maxH='300px'
									{...register('feedback', { required: i18nData.myRate + ' is required' })}
								/>
								<Field.ErrorText alignSelf='flex-start'>
									{errors.feedback?.message?.toString()}
								</Field.ErrorText>
							</Field.Root>
						</Fieldset.Content>

						<Fieldset.ErrorText>{verifyError}</Fieldset.ErrorText>

						<PrimaryButton w='100%' mt='8' type='submit' loading={isPending}>
							{i18nData.send}
						</PrimaryButton>
					</Fieldset.Root>
				</form>
			</Box>
		</CenteredModal>
	);
}
