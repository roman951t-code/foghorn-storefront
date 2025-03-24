'use client';
import { SimpleGrid } from '@chakra-ui/react';
import EditableInput from '@/components/reusable/inputs/EditableInput';
import { Field } from '@/components/ui/field';
import { useForm } from 'react-hook-form';

interface FormValues {
	email: string;
	phone: string;
	firstName: string;
	lastName: string;
}

interface Props {
	emailLabel: string;
	phoneLabel: string;
	firstNameLabel: string;
	lastNameLabel: string;
}

const initialValues = {
	email: 'test@mail.com',
	phone: '099-230-44-52',
	firstName: 'Roman',
	lastName: 'Onyshchenko',
};

export default function PersonalDataForm({
	emailLabel,
	phoneLabel,
	firstNameLabel,
	lastNameLabel,
}: Props) {
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
			<SimpleGrid
				className='productsSlider'
				columns={{ base: 1, sm: 2, md: 1, lg: 2 }}
				gap='4'
				w='100%'
				my='4'
				px='1'
			>
				<Field label={emailLabel} invalid={!!errors.email} errorText={errors.email?.message}>
					<EditableInput
						defaultValue={initialValues.email}
						onSubmit={(value) => handleEditableSubmit('email', value)}
					/>
				</Field>

				<Field label={phoneLabel} invalid={!!errors.phone} errorText={errors.phone?.message}>
					<EditableInput
						defaultValue={initialValues.phone}
						onSubmit={(value) => handleEditableSubmit('phone', value)}
					/>
				</Field>

				<Field
					label={firstNameLabel}
					invalid={!!errors.firstName}
					errorText={errors.firstName?.message}
				>
					<EditableInput
						defaultValue={initialValues.firstName}
						onSubmit={(value) => handleEditableSubmit('firstName', value)}
					/>
				</Field>

				<Field
					label={lastNameLabel}
					invalid={!!errors.lastName}
					errorText={errors.lastName?.message}
				>
					<EditableInput
						defaultValue={initialValues.lastName}
						onSubmit={(value) => handleEditableSubmit('lastName', value)}
					/>
				</Field>
			</SimpleGrid>
		</form>
	);
}
