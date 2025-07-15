'use client';

import React, { startTransition, useMemo, useState } from 'react';
import { Button, Input, Stack, Field, Fieldset } from '@chakra-ui/react';
import { useHookFormMask } from 'use-mask-input';
import { useForm } from 'react-hook-form';
import type { I18nData } from '@/types/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import { useActionState } from 'react';
import { createPhoneSignUpSchema } from 'formValidationSchemas/phoneSignUpSchema';
import { createphoneSignInSchema } from 'formValidationSchemas/phoneSignInSchema';
import PhoneConfirmation from './PhoneConfirmation';

interface PhoneAuthProps {
	i18nData: I18nData;
	disabled?: boolean;
	isSignup?: boolean;
}

type FormValues = {
	name?: string;
	phone: string;
};

const MAX_CHARACTERS = 60;

export default function PhoneAuth({ i18nData, disabled, isSignup = false }: PhoneAuthProps) {
	const schema = useMemo(
		() => (isSignup ? createPhoneSignUpSchema(i18nData) : createphoneSignInSchema(i18nData)),
		[i18nData]
	);

	const [formError, formAction, isPending] = useActionState(null, undefined);

	const [isSubmitted, setSubmitted] = useState(false);

	const {
		register,
		trigger,
		getValues,
		formState: { errors },
	} = useForm<FormValues>({ mode: 'onSubmit', resolver: zodResolver(schema) });
	const registerWithMask = useHookFormMask(register);

	if (isSubmitted) {
		return <PhoneConfirmation i18nData={i18nData} />;
	}

	return (
		<form
			action={async () => {
				const result = await trigger();
				if (!result) return;

				const formData = getValues();

				startTransition(() => {
					formAction(formData);
				});

				setSubmitted(true);
			}}
		>
			<Stack gap='4' align='flex-start'>
				<Fieldset.Root size='lg' invalid>
					<Fieldset.Content>
						{isSignup && (
							<Field.Root required={isSignup} invalid={!!errors.name}>
								<Field.Label>
									{i18nData.name}
									<Field.RequiredIndicator />
								</Field.Label>
								<Input fontSize='md' {...register('name')} maxLength={MAX_CHARACTERS} />
								<Field.ErrorText>{errors.name?.message}</Field.ErrorText>
							</Field.Root>
						)}

						<Field.Root required invalid={!!errors.phone}>
							<Field.Label>
								{i18nData.phoneNumber}
								<Field.RequiredIndicator />
							</Field.Label>

							<Input
								{...registerWithMask('phone', ['+380 99-999-9999', '99-999-9999'], {
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
					<Fieldset.ErrorText>{formError?.message}</Fieldset.ErrorText>
				</Fieldset.Root>

				<Button
					w='100%'
					type='submit'
					loading={isPending}
					disabled={disabled && isSignup}
					color='black'
					bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
				>
					{i18nData.continue}
				</Button>
			</Stack>
		</form>
	);
}
