'use client';
import { Input, Field, Wrap, Button, Box } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { I18nData } from '@/types/i18n';
import { useMemo } from 'react';
import { createAccountSchema } from 'formValidationSchemas/accountSchema';
import { z } from 'zod';
import PreferredDeliveryForm from './PreferredDeliveryForm';
import EmailDialog from './EmailDialog';
import PhoneDialog from './PhoneDialog';

interface Props {
	i18nData: I18nData;
}

const initialValues = {
	email: 'test@mail.com',
	phone: '380992304452',
	name: 'Roman Onyshchenko',
	shipmentAddress: 'Україна, Запорізька обл., м. Оріхів, вул. Запорізька, буд. 72, кв. 52',
};

export default function PersonalDataForm({ i18nData }: Props) {
	const schemaShape = useMemo(() => createAccountSchema(i18nData), [i18nData]);

	const nameSchema = useMemo(() => z.object({ name: schemaShape.name }), [schemaShape]);
	const emailSchema = useMemo(() => z.object({ email: schemaShape.email }), [schemaShape]);
	const phoneSchema = useMemo(() => z.object({ phone: schemaShape.phone }), [schemaShape]);
	const addressSchema = useMemo(
		() => z.object({ shipmentAddress: schemaShape.shipmentAddress }),
		[schemaShape]
	);
	const notificationSchema = useMemo(
		() => z.object({ notificationMethod: schemaShape.notificationMethod }),
		[schemaShape]
	);

	const nameForm = useForm({
		defaultValues: { name: initialValues.name },
		resolver: zodResolver(nameSchema),
	});

	const emailForm = useForm({
		defaultValues: { email: initialValues.email },
		resolver: zodResolver(emailSchema),
	});

	const phoneForm = useForm({
		defaultValues: { phone: initialValues.phone },
		resolver: zodResolver(phoneSchema),
	});

	const addressForm = useForm({
		defaultValues: { shipmentAddress: initialValues.shipmentAddress },
		resolver: zodResolver(addressSchema),
	});

	const handleFieldSubmit = (fieldName: string, data: any) => {
		console.log(`${fieldName} updated:`, data);
	};

	const fieldOrientation = { base: 'vertical', md: 'horizontal' };

	return (
		<Box m='0 auto'>
			<Wrap
				gapX='4'
				gapY='8'
				width='full'
				mt='4'
				colorPalette={{ base: 'orange', _dark: 'yellow' }}
				css={{ '--field-label-width': '150px' }}
			>
				<form onSubmit={nameForm.handleSubmit((data) => handleFieldSubmit('name', data))}>
					<Field.Root
						orientation={fieldOrientation}
						invalid={!!nameForm.formState.errors.name}
						gap='4'
						justifyContent='center'
					>
						<Field.Label maxH='20px'>{i18nData.name}</Field.Label>
						<Input {...nameForm.register('name')} variant='outline' size='md' maxW='xl' />
						<Field.ErrorText>{nameForm.formState.errors.name?.message}</Field.ErrorText>
						<Button
							type='submit'
							colorPalette='gray'
							color='main'
							variant='outline'
							border='1px solid '
							borderColor='border'
							size='md'
							rounded='md'
						>
							{i18nData.save}
						</Button>
					</Field.Root>
				</form>

				<form onSubmit={emailForm.handleSubmit((data) => handleFieldSubmit('email', data))}>
					<Field.Root
						orientation={fieldOrientation}
						invalid={!!emailForm.formState.errors.email}
						gap='4'
						justifyContent='center'
					>
						<Field.Label maxH='20px'>{i18nData.email}</Field.Label>
						<Input
							{...emailForm.register('email')}
							type='email'
							variant='outline'
							size='md'
							maxW='xl'
						/>
						<Field.ErrorText>{emailForm.formState.errors.email?.message}</Field.ErrorText>
						<EmailDialog i18nData={i18nData} />
					</Field.Root>
				</form>

				<form onSubmit={phoneForm.handleSubmit((data) => handleFieldSubmit('phone', data))}>
					<Field.Root
						orientation={fieldOrientation}
						invalid={!!phoneForm.formState.errors.phone}
						gap='4'
						justifyContent='center'
					>
						<Field.Label maxH='20px'>{i18nData.phone}</Field.Label>
						<Input {...phoneForm.register('phone')} variant='outline' size='md' maxW='xl' />
						<Field.ErrorText>{phoneForm.formState.errors.phone?.message}</Field.ErrorText>
						<PhoneDialog i18nData={i18nData} />
					</Field.Root>
				</form>

				<form
					onSubmit={addressForm.handleSubmit((data) => handleFieldSubmit('shipmentAddress', data))}
				>
					<Field.Root
						orientation={fieldOrientation}
						invalid={!!addressForm.formState.errors.shipmentAddress}
						gap='4'
						justifyContent='center'
					>
						<Field.Label maxH='20px'>{i18nData.shipmentAddress}</Field.Label>
						<Input
							{...addressForm.register('shipmentAddress')}
							variant='outline'
							size='md'
							maxW='xl'
						/>
						<Field.ErrorText>
							{addressForm.formState.errors.shipmentAddress?.message}
						</Field.ErrorText>
						<Button
							type='submit'
							color='main'
							variant='outline'
							colorPalette='gray'
							border='1px solid '
							borderColor='border'
							size='md'
							rounded='md'
						>
							{i18nData.save}
						</Button>
					</Field.Root>
				</form>

				<PreferredDeliveryForm
					schema={notificationSchema}
					i18nData={i18nData}
					onSubmitAction={(data) => handleFieldSubmit('notificationMethod', data)}
				/>
			</Wrap>
		</Box>
	);
}
