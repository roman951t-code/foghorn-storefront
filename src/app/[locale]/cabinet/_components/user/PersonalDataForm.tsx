'use client';
import { Fieldset, SimpleGrid } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { I18nData } from '@/types/i18n';
import { useMemo } from 'react';
import {
	createAccountSchema,
	EditNameActionPayload,
	NameSchemaData,
} from 'validationSchemas/accountSchema';
import { z } from 'zod';
import { useSession } from '@/providers/SessionProvider';
import { editNameAction } from '@/actions/auth/editAccountAction';
import NameForm from './NameForm';
import EmailForm from './EmailForm';
import PhoneForm from './PhoneForm';
import { showToaster } from '@/utils/toast';
import { toasterMessages } from '@/data/toasterMessages';

interface Props {
	i18nData: I18nData;
}

export default function PersonalDataForm({ i18nData }: Props) {
	const { session, refresh } = useSession();

	const userEmail = session?.user?.email;
	const userPhone = session?.user?.phoneNumber;
	const isGoogleUser = session?.user?.isGoogleUser;

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
		<SimpleGrid
			columns={{ base: 1, '2xl': 2 }}
			gap={{ base: 6, md: 8 }}
			mt='4'
			w='full'
			colorPalette='gray'
		>
			<NameForm
				i18nData={i18nData}
				nameForm={nameForm}
				onSubmitAction={nameForm.handleSubmit(handleNameSubmit)}
			/>
			<Fieldset.Root size='lg' alignItems='stretch' w='full'>
				<Fieldset.Content
					gap='6'
					borderWidth='0.5px'
					borderStyle='solid'
					borderColor='border'
					borderRadius='lg'
					p={{ base: 4, md: 6 }}
					bg='bg.tertiary'
					w='full'
					css={{ '--field-label-width': '150px' }}
				>
					<EmailForm
						isEmailVerified={session?.user?.emailVerified}
						i18nData={i18nData}
						emailForm={emailForm}
						userEmail={userEmail}
						isGoogleUser={isGoogleUser}
					/>
					<PhoneForm
						i18nData={i18nData}
						userPhone={userPhone}
						schema={phoneSchema}
						refreshSession={refreshSession}
					/>
				</Fieldset.Content>
			</Fieldset.Root>
		</SimpleGrid>
	);
}
