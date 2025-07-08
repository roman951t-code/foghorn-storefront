'use client';
import { Input, Field, Wrap, RadioCard, Stack, Icon } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import type { I18nData } from '@/types/i18n';
import { IoMailOutline } from 'react-icons/io5';
import { IoMdPhonePortrait } from 'react-icons/io';

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

	const items = [
		{ value: 'email', title: 'Email', icon: <IoMailOutline /> },
		{ value: 'phone', title: 'Телефон', icon: <IoMdPhonePortrait /> },
	];

	// телефон або email як бажаний спосіб сповіщень задізейблений пока юзер не добаве свій номер і підтвердить його

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

			<RadioCard.Root
				mt='16'
				colorPalette='gray'
				orientation={{ base: 'vertical', sm: 'horizontal' }}
				align='center'
				value={'email'}
				// onChange={(event) => {
				// 	const value = (event.target as HTMLInputElement).value;
				// 	setSelectedPayment(value);
				// }}
			>
				<RadioCard.Label fontSize='md' mb='3' fontWeight='normal'>
					{i18nData.preferredNotificationWay}
				</RadioCard.Label>
				<Stack direction={{ base: 'column', xs: 'row' }} gap='4'>
					{items.map((item) => (
						<RadioCard.Item
							key={item.value}
							value={item.value}
							_hover={{ cursor: 'pointer' }}
							maxW='sm'
						>
							<RadioCard.ItemHiddenInput />
							<RadioCard.ItemControl>
								<Icon fontSize='2xl' color='fg.muted'>
									{item.icon}
								</Icon>
								<RadioCard.ItemText>{item.title}</RadioCard.ItemText>
							</RadioCard.ItemControl>
						</RadioCard.Item>
					))}
				</Stack>
			</RadioCard.Root>
		</form>
	);
}
