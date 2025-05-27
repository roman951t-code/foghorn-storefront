'use client';
import { HStack, Stack } from '@chakra-ui/react';
import EditableInput from '@/components/reusable/inputs/EditableInput';
import { Field } from '@/components/ui/field';
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
			<HStack
				gap={{ base: '6' }}
				my='4'
				px='1'
				flexDirection='row'
				alignItems='center'
				flexWrap='wrap'
				css={{ '--field-label-width': '150px' }}
			>
				<Stack gap='4'>
					<Field
						minW='264px'
						orientation='vertical'
						label={i18nData.name}
						invalid={!!errors.firstName}
						errorText={errors.firstName?.message}
					>
						<EditableInput
							defaultValue={initialValues.firstName}
							onSubmit={(value) => handleEditableSubmit('firstName', value)}
						/>
					</Field>

					<Field
						minW='264px'
						orientation='vertical'
						label={i18nData.email}
						invalid={!!errors.email}
						errorText={errors.email?.message}
					>
						<EditableInput
							defaultValue={initialValues.email}
							onSubmit={(value) => handleEditableSubmit('email', value)}
						/>
					</Field>
				</Stack>

				<Stack gap='4'>
					<Field
						minW='264px'
						orientation='vertical'
						label={i18nData.phone}
						invalid={!!errors.phone}
						errorText={errors.phone?.message}
					>
						<EditableInput
							defaultValue={initialValues.phone}
							onSubmit={(value) => handleEditableSubmit('phone', value)}
						/>
					</Field>

					<Field
						minW='264px'
						orientation='vertical'
						label={i18nData.lastname}
						invalid={!!errors.lastName}
						errorText={errors.lastName?.message}
					>
						<EditableInput
							defaultValue={initialValues.lastName}
							onSubmit={(value) => handleEditableSubmit('lastName', value)}
						/>
					</Field>
				</Stack>
			</HStack>
		</form>
	);
}
