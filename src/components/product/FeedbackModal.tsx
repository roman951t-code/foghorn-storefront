'use client';
import { Box, Center, Input, Heading, Fieldset, RatingGroup, Textarea } from '@chakra-ui/react';
import { VscFeedback } from 'react-icons/vsc';
import CenteredModal from '@/components/dialogs/CenteredModal';
import { useForm } from 'react-hook-form';
import type { I18nData } from '@/types/i18n';
import { PrimaryButton, SecondaryButton } from '../reusable/buttons/ActionButton';
import { useState } from 'react';
import { Field } from '../reusable/chakra/field';

interface Props {
	i18nData: I18nData;
}

const emojiMap: Record<number, string> = {
	1: '🙁',
	2: '😕',
	3: '😏',
	4: '😊',
	5: '😍',
};

interface FormValues {
	name: string;
	email?: string;
	feedback: string;
	rating: number;
}

export default function FeedbackModal({ i18nData }: Props) {
	const [isOpen, setIsOpen] = useState(false);
	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
	} = useForm<FormValues>({
		mode: 'onSubmit',
		defaultValues: {
			rating: 5,
		},
	});

	const onSubmit = async (data: FormValues) => {
		try {
			console.log('Feedback Submitted:', data);
		} catch (error) {
			console.error('Submission failed:', error);
		}
	};

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
			size='sm'
		>
			<Box maxW='400px' p={4} borderRadius='lg' mx='auto'>
				<form onSubmit={handleSubmit(onSubmit)}>
					<Center flexDirection='column' gap='4' mb='6'>
						<Heading size='3xl' fontWeight='normal'>
							{i18nData.rate}
						</Heading>
						<RatingGroup.Root
							defaultValue={5}
							onValueChange={(val) => setValue('rating', Number(val))}
						>
							<RatingGroup.Control gap='4'>
								{Array.from({ length: 5 }).map((_, index) => (
									<RatingGroup.Item
										key={index}
										index={index + 1}
										minW='9'
										filter={{ base: 'orangescale(1)', _checked: 'revert' }}
										transition='scale 0.1s'
										scale='2'
										_hover={{ scale: '2.2', cursor: 'pointer' }}
									>
										{emojiMap[index + 1]}
									</RatingGroup.Item>
								))}
							</RatingGroup.Control>
						</RatingGroup.Root>
					</Center>

					<Fieldset.Root size='lg' maxW='md'>
						<Fieldset.Content gap='6'>
							<Field label={i18nData.name} required errorText={errors.name?.message}>
								<Input {...register('name', { required: i18nData.name + ' is required' })} />
							</Field>

							<Field label={i18nData.email} errorText={errors.email?.message}>
								<Input
									{...register('email', {
										pattern: {
											value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
											message: 'Invalid email address',
										},
									})}
									type='email'
								/>
							</Field>

							<Field label={i18nData.myRate} required errorText={errors.feedback?.message}>
								<Textarea
									minH='100px'
									maxH='300px'
									{...register('feedback', { required: i18nData.myRate + ' is required' })}
								/>
							</Field>
						</Fieldset.Content>
						<PrimaryButton w='100%' mt='8' type='submit'>
							{i18nData.send}
						</PrimaryButton>
					</Fieldset.Root>
				</form>
			</Box>
		</CenteredModal>
	);
}
