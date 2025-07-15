'use client';
import { Wrap, Box } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { I18nData } from '@/types/i18n';
import { startTransition, useActionState, useMemo } from 'react';
import { createAccountSchema } from 'formValidationSchemas/accountSchema';
import { z } from 'zod';
import PreferredDeliveryForm from './PreferredDeliveryForm';
import { useSession } from '@/components/providers/SessionProvider';
import AddressForm from './AddressForm';
import { editAccountAction } from '@/actions/editAccountAction';
import { toaster } from '@/components/ui/toaster';
import { authClient } from '@/lib/auth-client';
import NameForm from './NameForm';
import EmailForm from './EmailForm';
import PhoneForm from './PhoneForm';

interface Props {
	i18nData: I18nData;
}

const initialValues = {
	phone: '380992304452',
	shipmentAddress: 'Україна, Запорізька обл., м. Оріхів, вул. Запорізька, буд. 72, кв. 52',
};

export default function PersonalDataForm({ i18nData }: Props) {
	const { session } = useSession();
	const userEmail = session?.user?.email;

	const schemaShape = useMemo(() => createAccountSchema(i18nData), [i18nData]);

	const nameSchema = useMemo(() => z.object({ name: schemaShape.name }), [schemaShape]);
	const emailSchema = useMemo(() => z.object({ email: schemaShape.email }), [schemaShape]);
	const phoneSchema = useMemo(() => z.object({ phone: schemaShape.phone }), [schemaShape]);
	const addressSchema = useMemo(
		() => z.object({ shipmentAddress: schemaShape.shipmentAddress }),
		[schemaShape]
	);

	const [nameError, nameAction, isNamePending] = useActionState(editAccountAction, undefined);
	const [emailError, emailAction, isEmailPending] = useActionState(editAccountAction, undefined);
	const [phoneError, phoneAction, isPhonePending] = useActionState(editAccountAction, undefined);
	const [addressError, addressAction, isAddressPending] = useActionState(
		editAccountAction,
		undefined
	);

	const nameForm = useForm({
		defaultValues: { name: session?.user?.name },
		resolver: zodResolver(nameSchema),
	});

	const emailForm = useForm({
		defaultValues: { email: session?.user?.email },
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

	const handleNameSubmit = async (data: { name: string }) => {
		const payload = { schemaName: 'nameSchema' as 'nameSchema', email: userEmail };

		startTransition(async () => {
			await nameAction(payload);

			const result = await authClient.updateUser({
				name: data.name,
			});

			if (result?.error) {
				toaster.error({
					title: i18nData.editNameFail,
					duration: 5000,
				});
			} else {
				toaster.success({
					title: i18nData.nameUpdated,
					duration: 5000,
				});
			}
		});
	};

	const handleEmailSubmit = async (data: { email: string }) => {
		const payload = { schemaName: 'emailSchema' as 'emailSchema', email: userEmail };

		startTransition(async () => {
			await emailAction(payload);
		});
	};

	const handlePhoneSubmit = async (data: { phone: string }) => {
		const payload = { schemaName: 'phoneSchema' as 'phoneSchema', email: userEmail };

		startTransition(async () => {
			await phoneAction(payload);
		});
	};

	const handleAddressSubmit = async (data: { shipmentAddress: string }) => {
		const payload = { schemaName: 'addressSchema' as 'addressSchema', email: userEmail };

		startTransition(async () => {
			await addressAction(payload);
		});
	};

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
				<NameForm
					i18nData={i18nData}
					pending={isNamePending}
					nameForm={nameForm}
					error={nameError}
					onSubmitAction={nameForm.handleSubmit(handleNameSubmit)}
				/>

				<EmailForm
					i18nData={i18nData}
					pending={isEmailPending}
					emailForm={emailForm}
					error={emailError}
					onSubmitAction={emailForm.handleSubmit(handleEmailSubmit)}
				/>

				<PhoneForm
					i18nData={i18nData}
					pending={isPhonePending}
					phoneForm={phoneForm}
					error={phoneError}
					onSubmitAction={phoneForm.handleSubmit(handlePhoneSubmit)}
				/>

				<AddressForm
					i18nData={i18nData}
					addressForm={addressForm}
					error={addressError}
					pending={isAddressPending}
					onSubmitAction={addressForm.handleSubmit(handleAddressSubmit)}
				/>

				<PreferredDeliveryForm
					schemaShape={schemaShape}
					i18nData={i18nData}
					onSubmitAction={(data) => handleFieldSubmit('notificationMethod', data)}
				/>
			</Wrap>
		</Box>
	);
}
