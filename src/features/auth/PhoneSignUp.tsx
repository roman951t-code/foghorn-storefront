'use client';

import { useMemo, useState } from 'react';
import { Input, Stack, Field, Fieldset } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import type { I18nData } from '@/types/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	createPhoneSignUpSchema,
	PhoneSignUpSchema,
} from 'formValidationSchemas/phoneSignUpSchema';
import { PrimaryButton } from '@/components/ui/buttons/ActionButton';
import { phoneSignUpAction } from '@/actions/auth/phoneSignUpAction';
import { useSession } from '@/providers/SessionProvider';
import { PHONE_INPUT_MASKS, MAX_NAME_LENGTH } from '@/constants/auth';
import { useMaskedInput } from '@/hooks/useMaskedInput';

interface PhoneAuthProps {
	i18nData: I18nData;
	disabled?: boolean;
}

export default function PhoneSignUp({ i18nData, disabled }: PhoneAuthProps) {
	const schema = useMemo(() => createPhoneSignUpSchema(i18nData), [i18nData]);

	const { refresh } = useSession();
	const [authError, setAuthError] = useState('');

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<PhoneSignUpSchema>({ mode: 'onSubmit', resolver: zodResolver(schema) });
	const registerWithMask = useMaskedInput(register);

	const onSubmit = async (formData: PhoneSignUpSchema) => {
		setAuthError('');

		try {
			const result = await phoneSignUpAction(null, formData);

			if (!result?.success) {
				setAuthError(result?.message || i18nData.userRegisterFail);
				return;
			}

			await refresh();

			const bc = new BroadcastChannel('auth');
			bc.postMessage('session-updated');
			bc.close();
		} catch {
			setAuthError(i18nData.invalidFormData);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Stack gap='4' align='flex-start'>
				<Fieldset.Root size='lg' invalid>
					<Fieldset.Content>
						<Field.Root required invalid={!!errors.name}>
							<Field.Label>
								{i18nData.name}
								<Field.RequiredIndicator />
							</Field.Label>
							<Input fontSize='md' {...register('name')} maxLength={MAX_NAME_LENGTH} />
							<Field.ErrorText>{errors.name?.message}</Field.ErrorText>
						</Field.Root>

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
