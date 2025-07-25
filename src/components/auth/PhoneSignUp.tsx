'use client';

import React, { useMemo, useState } from 'react';
import { Input, Stack, Field, Fieldset } from '@chakra-ui/react';
import { useHookFormMask } from 'use-mask-input';
import { useForm } from 'react-hook-form';
import type { I18nData } from '@/types/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	createPhoneSignUpSchema,
	PhoneSignUpSchema,
} from 'formValidationSchemas/phoneSignUpSchema';
import { PrimaryButton } from '../reusable/buttons/ActionButton';
import { sendVerifyPhoneAction } from '@/actions/sendVerifyPhoneAction';
import dynamic from 'next/dynamic';

const PhoneConfirmation = dynamic(() => import('./PhoneConfirmation'));

interface PhoneAuthProps {
	i18nData: I18nData;
	disabled?: boolean;
}

const MAX_CHARACTERS = 60;

export default function PhoneSignUp({ i18nData, disabled }: PhoneAuthProps) {
	const schema = useMemo(() => createPhoneSignUpSchema(i18nData), [i18nData]);

	const [authError, setAuthError] = useState('');
	const [isPending, setIsPending] = useState(false);
	const [isSubmitted, setSubmitted] = useState(false);

	const {
		register,
		watch,
		handleSubmit,
		formState: { errors },
	} = useForm<PhoneSignUpSchema>({ mode: 'onSubmit', resolver: zodResolver(schema) });
	const registerWithMask = useHookFormMask(register);

	const watchedName = watch('name');
	const watchedPhone = watch('phone');

	const onSubmit = async (formData: PhoneSignUpSchema) => {
		setIsPending(true);

		try {
			const result = await sendVerifyPhoneAction(null, formData);

			if (!result?.success) {
				setAuthError(result?.message!);
			}
		} catch (err) {
			setAuthError(i18nData.invalidFormData);
		} finally {
			setIsPending(false);
			setSubmitted(true);
		}
	};

	if (isSubmitted) {
		return (
			<PhoneConfirmation
				i18nData={i18nData}
				name={watchedName}
				phone={watchedPhone}
				signup={true}
			/>
		);
	}

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
							<Input fontSize='md' {...register('name')} maxLength={MAX_CHARACTERS} />
							<Field.ErrorText>{errors.name?.message}</Field.ErrorText>
						</Field.Root>

						<Field.Root required invalid={!!errors.phone}>
							<Field.Label>
								{i18nData.phoneNumber}
								<Field.RequiredIndicator />
							</Field.Label>

							<Input
								{...registerWithMask('phone', ['380999999999', '999999999'], {
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

				<PrimaryButton w='100%' type='submit' loading={isPending} disabled={disabled}>
					{i18nData.continue}
				</PrimaryButton>
			</Stack>
		</form>
	);
}
