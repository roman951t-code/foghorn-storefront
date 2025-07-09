'use client';
import { Input, Field, Wrap, RadioCard, Stack, Icon, Button } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import type { I18nData } from '@/types/i18n';
import { IoMailOutline } from 'react-icons/io5';
import { IoMdPhonePortrait } from 'react-icons/io';

interface FormValues {
	email: string;
	phone: string;
	name: string;
	shipmentAddress: string;
}

const items = [
	{ value: 'email', title: 'Email', icon: <IoMailOutline /> },
	{ value: 'phone', title: 'Телефон', icon: <IoMdPhonePortrait /> },
];

const initialValues = {
	email: 'test@mail.com',
	phone: '099-230-44-52',
	name: 'Roman Onyshchenko',
	shipmentAddress: 'Україна, Запорізька обл., м. Оріхів, вул. Запорізька, буд. 72, кв. 52',
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

	// телефон або email як бажаний спосіб сповіщень задізейблений пока юзер не добаве свій номер і підтвердить його

	return (
		<form onSubmit={onSubmit}>
			<Wrap
				gapX='4'
				gapY='8'
				width='full'
				mt='4'
				colorPalette={{ base: 'orange', _dark: 'yellow' }}
			>
				<Field.Root
					orientation='vertical'
					invalid={!!errors.name}
					maxW={{ base: '100%', xs: 'xs' }}
				>
					<Field.Label>{i18nData.name}</Field.Label>
					<Input
						variant='outline'
						transition='all .15s ease-in-out'
						_placeholder={{ fontSize: 'sm' }}
						_focus={{
							outline: 'none',
						}}
						size='md'
						fontSize='md'
						defaultValue={initialValues.name}
						onChange={(value) => handleEditableSubmit('name', value)}
					/>
					<Field.ErrorText>{errors.name?.message}</Field.ErrorText>
				</Field.Root>

				<Field.Root
					orientation='vertical'
					invalid={!!errors.email}
					maxW={{ base: '100%', xs: 'xs' }}
				>
					<Field.Label>{i18nData.email}</Field.Label>
					<Input
						variant='outline'
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
					maxW={{ base: '100%', xs: 'xs' }}
				>
					<Field.Label>{i18nData.phone}</Field.Label>
					<Input
						variant='outline'
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
			</Wrap>
			<Field.Root
				orientation='vertical'
				invalid={!!errors.shipmentAddress}
				mt='8'
				maxW='1008px'
				colorPalette={{ base: 'orange', _dark: 'yellow' }}
			>
				<Field.Label>{i18nData.shipmentAddress}</Field.Label>
				<Input
					variant='outline'
					size='md'
					transition='all .15s ease-in-out'
					_placeholder={{ fontSize: 'sm' }}
					_focus={{
						outline: 'none',
					}}
					fontSize='md'
					defaultValue={initialValues.shipmentAddress}
					onChange={(value) => handleEditableSubmit('shipmentAddress', value)}
				/>
				<Field.ErrorText>{errors.shipmentAddress?.message}</Field.ErrorText>
			</Field.Root>

			<RadioCard.Root
				mt='12'
				colorPalette={{ base: 'orange', _dark: 'yellow' }}
				orientation={{ base: 'vertical', sm: 'horizontal' }}
				align='center'
				// value={'email'}
				css={{
					'& div[data-state="unchecked"] span': {
						color: 'var(--chakra-colors-fg) !important',
					},
				}}
				// onChange={(event) => {
				// 	const value = (event.target as HTMLInputElement).value;
				// 	setSelectedPayment(value);
				// }}
			>
				<RadioCard.Label fontSize='md' mb='4' fontWeight='normal'>
					{i18nData.preferredNotificationWay}
				</RadioCard.Label>
				<Stack direction={{ base: 'column', xs: 'row' }} gap='4'>
					{items.map((item) => (
						<RadioCard.Item
							key={item.value}
							value={item.value}
							boxShadow='none'
							_hover={{ cursor: 'pointer' }}
							maxW='xs'
							bg='main'
							justifyContent={{ base: 'initial', xs: 'center' }}
							h={{ base: 'auto', sm: '42px' }}
						>
							<RadioCard.ItemHiddenInput />
							<RadioCard.ItemControl>
								<Icon fontSize='2xl' color='fg.muted'>
									{item.icon}
								</Icon>
								<RadioCard.ItemText>{item.title}</RadioCard.ItemText>
								<RadioCard.ItemIndicator />
							</RadioCard.ItemControl>
						</RadioCard.Item>
					))}
				</Stack>
			</RadioCard.Root>

			<Button
				type='submit'
				bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
				color='black'
				variant='solid'
				minWidth='280px'
				rounded='md'
				mt='12'
				alignSelf='center'
			>
				{i18nData.save}
			</Button>
		</form>
	);
}
