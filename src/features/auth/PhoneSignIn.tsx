'use client';

import { useMemo, useState } from 'react';
import { Input, Stack, Field, Fieldset } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import type { I18nData } from '@/types/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	createPhoneSignInSchema,
	PhoneSignInSchema,
} from 'formValidationSchemas/phoneSignInSchema';
import { PrimaryButton } from '@/components/ui/buttons/ActionButton';
import { phoneSignInAction } from '@/actions/auth/phoneSignInAction';
import { useSession } from '@/providers/SessionProvider';
import { PHONE_INPUT_MASKS } from '@/constants/auth';
import { useMaskedInput } from '@/hooks/useMaskedInput';

interface PhoneAuthProps {
	i18nData: I18nData;
	disabled?: boolean;
	isSignup?: boolean;
}

export default function PhoneSignIn({ i18nData, disabled }: PhoneAuthProps) {
	const schema = useMemo(() => createPhoneSignInSchema(i18nData), [i18nData]);

	const { refresh } = useSession();
	const [authError, setAuthError] = useState('');

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<PhoneSignInSchema>({ mode: 'onSubmit', resolver: zodResolver(schema) });
	const registerWithMask = useMaskedInput(register);

	const onSubmit = async (formData: PhoneSignInSchema) => {
		setAuthError('');

		try {
			const result = await phoneSignInAction(null, formData);

			if (!result?.success) {
				setAuthError(result?.message || i18nData.userLoginFail);
				return;
			}

			await refresh();

			const bc = new BroadcastChannel('auth');
			bc.postMessage('session-updated');
			bc.close();
		} catch (err) {
			setAuthError(i18nData.invalidFormData);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Stack gap='4' align='flex-start'>
				<Fieldset.Root size='lg' invalid>
					<Fieldset.Content>
						<Field.Root required invalid={!!errors.phone}>
							<Field.Label>
								{i18nData.phoneNumber}
								<Field.RequiredIndicator />
							</Field.Label>

							<Input
								{...registerWithMask('phone', PHONE_INPUT_MASKS, {
									required: i18nData.phoneRequired,
								})}
								type='text'
								_focus={{ outline: 'none' }}
								fontSize='md'
								maxLength={17}
							/>
							<Field.ErrorText>{errors.phone?.message}</Field.ErrorText>
						</Field.Root>
					</Fieldset.Content>
					<Fieldset.ErrorText>{authError}</Fieldset.ErrorText>
				</Fieldset.Root>

				<PrimaryButton
					w='100%'
					type='submit'
					loading={isSubmitting}
					disabled={disabled || isSubmitting}
				>
					{i18nData.continue}
				</PrimaryButton>
			</Stack>
		</form>
	);
}
