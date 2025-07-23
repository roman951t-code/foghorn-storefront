'use client';
import { Fieldset, Wrap } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { I18nData } from '@/types/i18n';
import { startTransition, useActionState, useMemo, useState } from 'react';
import {
	createAccountSchema,
	EditNameActionPayload,
	NameSchemaData,
} from 'formValidationSchemas/accountSchema';
import { z } from 'zod';
import PreferredDeliveryForm from './PreferredDeliveryForm';
import { useSession } from '@/components/providers/SessionProvider';
import AddressForm from './AddressForm';
import { editAccountAction, editNameAction } from '@/actions/editAccountAction';
import { toaster } from '@/components/ui/toaster';
import { authClient } from '@/lib/auth-client';
import NameForm from './NameForm';
import EmailForm from './EmailForm';
import PhoneForm from './PhoneForm';

interface Props {
	i18nData: I18nData;
}

export default function PersonalDataForm({ i18nData }: Props) {
	const { session } = useSession();
	const userEmail = session?.user?.email;
	const userPhone = session?.user?.phoneNumber;

	const [emailDialogOpen, setEmailDialogOpen] = useState(false);

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

	const [emailError, emailAction, isEmailPending] = useActionState(editAccountAction, undefined);
	const [phoneError, phoneAction, isPhonePending] = useActionState(editAccountAction, undefined);
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

	const phoneForm = useForm({
		defaultValues: { phone: userPhone },
		resolver: zodResolver(phoneSchema),
	});

	const addressForm = useForm({
		defaultValues: {
			shipmentAddress: 'Запорізька обл., м. Оріхів, вул. Запорізька, буд. 72, кв. 52',
		},
		resolver: zodResolver(addressSchema),
	});

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

	const handleEmailSubmit = async (data: { email: string }) => {
		const payload = { schemaName: 'emailSchema' as 'emailSchema', email: userEmail };

		startTransition(async () => {
			await emailAction(payload);

			const result = await authClient.changeEmail({
				newEmail: data.email,
				callbackURL: '/?email-change=true',
			});

			if (result?.error) {
				toaster.error({
					title: i18nData.editEmailFail,
					duration: 5000,
				});
			} else {
				setEmailDialogOpen(true);
			}
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
						i18nData={i18nData}
						pending={isEmailPending}
						emailForm={emailForm}
						error={emailError}
						isOpen={emailDialogOpen}
						userEmail={userEmail}
						setIsOpenAction={setEmailDialogOpen}
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
				</Fieldset.Content>
			</Fieldset.Root>
			<PreferredDeliveryForm
				userEmail={userEmail}
				userPhone={userPhone}
				i18nData={i18nData}
				schemaShape={schemaShape}
			/>
		</Wrap>
	);
}
