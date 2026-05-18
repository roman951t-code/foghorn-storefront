'use client';
import { Box, Fieldset, VStack } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { I18nData } from '@/types/i18n';
import { useMemo } from 'react';
import {
	createNameSchema,
	createPhoneSchema,
	EditNameActionPayload,
	NameSchemaData,
} from 'validationSchemas/accountSchema';
import { useSession } from '@/providers/SessionProvider';
import { editNameAction } from '@/actions/auth/editAccountAction';
import NameForm from './NameForm';
import EmailForm from './EmailForm';
import PhoneForm from './PhoneForm';
import AddressForm from './AddressForm';
import { showToaster } from '@/utils/toast';
import { toasterMessages } from '@/data/toasterMessages';
import { toShippingAddressFormValue } from '@/utils/shippingAddress';
import PreferredDeliveryForm from './PreferredDeliveryForm';

interface Props {
	i18nData: I18nData;
}

export default function PersonalDataForm({ i18nData }: Props) {
	const { session, refresh } = useSession();

	const userEmail = session?.user?.email ?? undefined;
	const userPhone = session?.user?.phoneNumber ?? undefined;
	const userNotifMethod = session?.user?.notificationMethod ?? null;
	const preferredNotificationMethod =
		userNotifMethod === 'phone' || userNotifMethod === 'email'
			? userNotifMethod
			: userEmail
				? 'email'
				: userPhone
					? 'phone'
					: 'email';

	const nameSchema = useMemo(() => createNameSchema(i18nData), [i18nData]);
	const phoneSchema = useMemo(() => createPhoneSchema(i18nData), [i18nData]);
	const shippingAddressDefault = useMemo(
		() =>
			toShippingAddressFormValue({
				country: session?.user?.shippingCountry ?? null,
				region: session?.user?.shippingRegion ?? null,
				city: session?.user?.shippingCity ?? null,
				postalCode: session?.user?.shippingPostalCode ?? null,
				addressLine1: session?.user?.shippingAddressLine1 ?? null,
				addressLine2: session?.user?.shippingAddressLine2 ?? null,
			}),
		[
			session?.user?.shippingAddressLine1,
			session?.user?.shippingAddressLine2,
			session?.user?.shippingCity,
			session?.user?.shippingCountry,
			session?.user?.shippingPostalCode,
			session?.user?.shippingRegion,
		]
	);

	const nameForm = useForm({
		defaultValues: {
			name: session?.user?.name ?? '',
			lastName: session?.user?.lastName ?? '',
			middleName: session?.user?.middleName ?? '',
		},
		resolver: zodResolver(nameSchema),
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
				showToaster('success', toasterMessages.nameUpdated(i18nData));
				await refreshSession();
			} else {
				showToaster('error', toasterMessages.nameUpdateFailed(i18nData));
			}
		} catch {
			showToaster('error', toasterMessages.nameUpdateFailed(i18nData));
		}
	};

	return (
		<VStack mt='4' w='full' colorPalette='gray' alignItems='stretch' gap='6'>
			<NameForm
				i18nData={i18nData}
				nameForm={nameForm}
				onSubmitAction={nameForm.handleSubmit(handleNameSubmit)}
			/>
			<Fieldset.Root size='lg' alignItems='stretch' w='full'>
				<Fieldset.Content
					css={{ '--field-label-width': '150px' }}
					bg='bg.tertiary'
					gap='6'
					borderWidth='0.5px'
					borderStyle='solid'
					borderColor='border'
					borderRadius='lg'
					p={{ base: 4, md: 6 }}
					w='full'
				>
					<Box
						display='grid'
						gridTemplateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }}
						gap='3'
					>
						<EmailForm i18nData={i18nData} userEmail={userEmail} />
						<PhoneForm
							i18nData={i18nData}
							userPhone={userPhone}
							schema={phoneSchema}
							refreshSession={refreshSession}
						/>
					</Box>
					<PreferredDeliveryForm
						i18nData={i18nData}
						userEmail={userEmail}
						userPhone={userPhone}
						userNotifMethod={preferredNotificationMethod}
						refreshSessionAction={refreshSession}
					/>
				</Fieldset.Content>
			</Fieldset.Root>
			<AddressForm
				i18nData={i18nData}
				initialAddress={shippingAddressDefault}
				refreshSession={refreshSession}
			/>
		</VStack>
	);
}
