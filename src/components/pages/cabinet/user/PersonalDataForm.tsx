'use client';
import { HStack, Input, Field, Wrap } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import type { I18nData } from '@/types/i18n';

interface FormValues {
	email: string;
	phone: string;
	firstName: string;
	lastName: string;
}

const initialValues = {
	email: 'test@mail.com',
	phone: '099-230-44-52',
	firstName: 'Roman',
	lastName: 'Onyshchenko',
};

interface Props {
	i18nData: I18nData;
}

export default function PersonalDataForm({ i18nData }: Props) {
	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({
		defaultValues: initialValues,
		mode: 'onSubmit',
	});

	const handleEditableSubmit = (field: keyof FormValues, value: string) => {
		setValue(field, value);
	};

	const onSubmit = handleSubmit(async (data) => {
		try {
			console.log('Form Submitted:', data);
		} catch (error) {
			console.error('Submission failed:', error);
		}
	});

	return (
		<form onSubmit={onSubmit}>
			<Wrap gap='8' width='full' mt='8' colorPalette='yellow'>
				<Field.Root
					orientation='vertical'
					invalid={!!errors.firstName}
					maxW={{ base: '100%', xs: '300px' }}
				>
					<Field.Label>{i18nData.name}</Field.Label>
					<Input
						variant='flushed'
						transition='all .15s ease-in-out'
						_placeholder={{ fontSize: 'sm' }}
						_focus={{
							outline: 'none',
						}}
						size='md'
						fontSize='md'
						defaultValue={initialValues.firstName}
						onChange={(value) => handleEditableSubmit('firstName', value)}
					/>
					<Field.ErrorText>{errors.firstName?.message}</Field.ErrorText>
				</Field.Root>

				<Field.Root
					orientation='vertical'
					invalid={!!errors.email}
					maxW={{ base: '100%', xs: '300px' }}
				>
					<Field.Label>{i18nData.email}</Field.Label>
					<Input
						variant='flushed'
						size='md'
						transition='all .15s ease-in-out'
						_placeholder={{ fontSize: 'sm' }}
						_focus={{
							outline: 'none',
						}}
						type='email'
						fontSize='md'
						defaultValue={initialValues.email}
						onChange={(value) => handleEditableSubmit('email', value)}
					/>
					<Field.ErrorText>{errors.email?.message}</Field.ErrorText>
				</Field.Root>

				<Field.Root
					orientation='vertical'
					invalid={!!errors.phone}
					maxW={{ base: '100%', xs: '300px' }}
				>
					<Field.Label>{i18nData.phone}</Field.Label>
					<Input
						variant='flushed'
						size='md'
						transition='all .15s ease-in-out'
						_placeholder={{ fontSize: 'sm' }}
						_focus={{
							outline: 'none',
						}}
						fontSize='md'
						defaultValue={initialValues.phone}
						onChange={(value) => handleEditableSubmit('phone', value)}
					/>
					<Field.ErrorText>{errors.phone?.message}</Field.ErrorText>
				</Field.Root>

				<Field.Root
					orientation='vertical'
					invalid={!!errors.lastName}
					maxW={{ base: '100%', xs: '300px' }}
				>
					<Field.Label>{i18nData.lastname}</Field.Label>
					<Input
						variant='flushed'
						size='md'
						transition='all .15s ease-in-out'
						_placeholder={{ fontSize: 'sm' }}
						_focus={{
							outline: 'none',
						}}
						fontSize='md'
						defaultValue={initialValues.lastName}
						onChange={(value) => handleEditableSubmit('lastName', value)}
					/>
					<Field.ErrorText>{errors.lastName?.message}</Field.ErrorText>
				</Field.Root>
			</Wrap>
		</form>
	);
}
