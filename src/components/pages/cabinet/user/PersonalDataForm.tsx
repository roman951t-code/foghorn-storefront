'use client';
import { Fieldset, Wrap } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { I18nData } from '@/types/i18n';
import { startTransition, useActionState, useMemo } from 'react';
import {
	createAccountSchema,
	EditNameActionPayload,
	NameSchemaData,
} from 'formValidationSchemas/accountSchema';
import { z } from 'zod';
import PreferredDeliveryForm from './PreferredDeliveryForm';
import { useSession } from '@/components/providers/SessionProvider';
import AddressForm from './AddressForm';
import { editAccountAction, editNameAction } from '@/actions/auth/editAccountAction';
import NameForm from './NameForm';
import EmailForm from './EmailForm';
import PhoneForm from './PhoneForm';
import { toaster } from '@/components/reusable/chakra/toaster';

interface Props {
	i18nData: I18nData;
}

export default function PersonalDataForm({ i18nData }: Props) {
	const { session, refresh } = useSession();

	const userEmail = session?.user?.email;
	const userPhone = session?.user?.phoneNumber;
	const userNotifMethod = session?.user?.notificationMethod;

	const schemaShape = useMemo(() => createAccountSchema(i18nData), [i18nData]);
	const nameSchema = useMemo(
		() =>
			z.object({
				name: schemaShape.name,
				lastName: schemaShape.lastName,
				middleName: schemaShape.middleName,
			}),
		[schemaShape]
	);
	const emailSchema = useMemo(() => z.object({ email: schemaShape.email }), [schemaShape]);
	const phoneSchema = useMemo(() => z.object({ phone: schemaShape.phone }), [schemaShape]);
	const addressSchema = useMemo(
		() => z.object({ shipmentAddress: schemaShape.shipmentAddress }),
		[schemaShape]
	);

	const [addressError, addressAction, isAddressPending] = useActionState(
		editAccountAction,
		undefined
	);

	const nameForm = useForm({
		defaultValues: {
			name: session?.user?.name,
			lastName: session?.user?.lastName,
			middleName: session?.user?.middleName,
		},
		resolver: zodResolver(nameSchema),
	});

	const emailForm = useForm({
		defaultValues: { email: session?.user?.email },
		resolver: zodResolver(emailSchema),
	});

	const addressForm = useForm({
		defaultValues: {
			shipmentAddress: 'Запорізька обл., м. Оріхів, вул. Запорізька, буд. 72, кв. 52',
		},
		resolver: zodResolver(addressSchema),
	});

	const refreshSession = async () => {
		await refresh();

		const bc = new BroadcastChannel('auth');
		bc.postMessage('session-updated');
		bc.close();
	};

	const handleNameSubmit = async (data: NameSchemaData) => {
		const payload: EditNameActionPayload = {
			...data,
			email: userEmail || '',
		};

		try {
			const result = await editNameAction(null, payload);

			if (result?.success) {
				toaster.success({
					title: i18nData.nameUpdated,
					duration: 5000,
				});

				await refreshSession();
			} else {
				toaster.error({
					title: i18nData.editNameFail,
					duration: 5000,
				});
			}
		} catch {
			toaster.error({
				title: i18nData.editNameFail,
				duration: 5000,
			});
		}
	};

	const handleAddressSubmit = async (data: { shipmentAddress: string }) => {
		const payload = { schemaName: 'addressSchema' as 'addressSchema', email: userEmail };

		startTransition(async () => {
			await addressAction(payload);
		});
	};

	return (
		<Wrap gapX='4' gapY='8' mt='4' colorPalette={{ base: 'orange', _dark: 'yellow' }}>
			<NameForm
				i18nData={i18nData}
				nameForm={nameForm}
				onSubmitAction={nameForm.handleSubmit(handleNameSubmit)}
			/>
			<Fieldset.Root size='lg' alignItems='center'>
				<Fieldset.Content
					gap='6'
					border='1px solid'
					borderColor='border.dark'
					borderRadius='md'
					p='4'
					maxW='4xl'
					css={{ '--field-label-width': '150px' }}
				>
					<EmailForm
						isEmailVerified={session?.user?.emailVerified}
						i18nData={i18nData}
						emailForm={emailForm}
						userEmail={userEmail}
					/>
					<PhoneForm
						i18nData={i18nData}
						userPhone={userPhone}
						schema={phoneSchema}
						refreshSession={refreshSession}
					/>
					<AddressForm
						i18nData={i18nData}
						addressForm={addressForm}
						error={addressError}
						pending={isAddressPending}
						onSubmitAction={addressForm.handleSubmit(handleAddressSubmit)}
					/>
				</Fieldset.Content>
			</Fieldset.Root>
			<PreferredDeliveryForm
				userEmail={userEmail}
				userPhone={userPhone}
				i18nData={i18nData}
				userNotifMethod={userNotifMethod}
				refreshSession={refreshSession}
			/>
		</Wrap>
	);
}
