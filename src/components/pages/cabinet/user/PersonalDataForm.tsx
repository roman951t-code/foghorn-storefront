'use client';
import { Flex, Stack } from '@chakra-ui/react';
import EditableInput from '@/components/reusable/inputs/EditableInput';
import { Field } from '@/components/ui/field';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';

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

export default function PersonalDataForm() {
	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({
		defaultValues: initialValues,
		mode: 'onSubmit',
	});

	const authT = useTranslations('Auth');

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
			<Flex
				className='productsSlider'
				gap='4'
				my='4'
				px='1'
				flexDirection='row'
				alignItems='center'
				justifyContent='space-between'
				flexWrap='wrap'
				w={{ base: '100%', xl: '75%' }}
				css={{ '--field-label-width': '150px' }}
			>
				<Stack gap='4'>
					<Field
						minW='200px'
						orientation='vertical'
						label={authT('name')}
						invalid={!!errors.firstName}
						errorText={errors.firstName?.message}
					>
						<EditableInput
							defaultValue={initialValues.firstName}
							onSubmit={(value) => handleEditableSubmit('firstName', value)}
						/>
					</Field>

					<Field
						minW='200px'
						orientation='vertical'
						label={authT('email')}
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
						minW='200px'
						orientation='vertical'
						label={authT('phone')}
						invalid={!!errors.phone}
						errorText={errors.phone?.message}
					>
						<EditableInput
							defaultValue={initialValues.phone}
							onSubmit={(value) => handleEditableSubmit('phone', value)}
						/>
					</Field>

					<Field
						minW='200px'
						orientation='vertical'
						label={authT('lastname')}
						invalid={!!errors.lastName}
						errorText={errors.lastName?.message}
					>
						<EditableInput
							defaultValue={initialValues.lastName}
							onSubmit={(value) => handleEditableSubmit('lastName', value)}
						/>
					</Field>
				</Stack>
			</Flex>
		</form>
	);
}
