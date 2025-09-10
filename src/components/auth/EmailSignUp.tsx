'use client';

import { Input, Stack, Field, Fieldset, Text, Highlight } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { sendVerifyEmailAction } from '@/actions/auth/sendVerifyEmailAction';
import {
	createEmailSignUpSchema,
	EmailSignUpSchema,
} from 'formValidationSchemas/emailSignUpSchema';
import type { I18nData } from '@/types/i18n';
import { PrimaryButton } from '../reusable/buttons/ActionButton';
import { PasswordInput } from '../reusable/chakra/password-input';
import EmailConfirmation from './EmailConfirmation';

interface EmailAuthProps {
	i18nData: I18nData;
	disabled?: boolean;
	backToLogin: () => void;
}

const MAX_CHARACTERS = 60;

export default function EmailSignUp({ i18nData, disabled, backToLogin }: EmailAuthProps) {
	const [isSubmitted, setSubmitted] = useState(false);
	const [authError, setAuthError] = useState('');
	const [isPending, setIsPending] = useState(false);

	const schema = useMemo(() => createEmailSignUpSchema(i18nData), [i18nData]);

	const {
		register,
		getValues,
		handleSubmit,
		formState: { errors },
	} = useForm<EmailSignUpSchema>({
		mode: 'onSubmit',
		resolver: zodResolver(schema),
	});

	const onSubmit = async (formData: EmailSignUpSchema) => {
		setIsPending(true);

		try {
			const result = await sendVerifyEmailAction(null, formData);

			if (!result?.success) {
				setAuthError(result?.message!);
			} else {
				setSubmitted(true);
			}
		} catch {
			setAuthError(i18nData.invalidFormData);
		} finally {
			setIsPending(false);
		}
	};

	const formData = getValues();

	if (isSubmitted) {
		return (
			<EmailConfirmation i18nData={i18nData} resendData={formData} backToLogin={backToLogin} />
		);
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Stack gap='4' align='flex-start'>
				<Fieldset.Root size='lg' invalid>
					<Fieldset.Content>
						<Field.Root required invalid={!!errors.name || !!authError}>
							<Field.Label>
								{i18nData.name}
								<Field.RequiredIndicator />
							</Field.Label>
							<Input fontSize='md' {...register('name')} maxLength={MAX_CHARACTERS} />
							<Field.ErrorText>{errors.name?.message}</Field.ErrorText>
						</Field.Root>

						<Field.Root required invalid={!!errors.email}>
							<Field.Label>
								{i18nData.email}
								<Field.RequiredIndicator />
							</Field.Label>
							<Input fontSize='md' {...register('email')} maxLength={MAX_CHARACTERS} />
							<Field.ErrorText>{errors.email?.message}</Field.ErrorText>
						</Field.Root>

						<Field.Root required invalid={!!errors.password}>
							<Field.Label>
								{i18nData.password}
								<Field.RequiredIndicator />
							</Field.Label>
							<PasswordInput fontSize='md' {...register('password')} maxLength={MAX_CHARACTERS} />
							<Field.ErrorText>{errors.password?.message}</Field.ErrorText>
						</Field.Root>

						<Field.Root required invalid={!!errors.confirmPassword}>
							<Field.Label>
								{i18nData.confirmPassword}
								<Field.RequiredIndicator />
							</Field.Label>
							<PasswordInput
								{...register('confirmPassword')}
								fontSize='md'
								maxLength={MAX_CHARACTERS}
							/>
							<Field.ErrorText>{errors.confirmPassword?.message}</Field.ErrorText>
						</Field.Root>
					</Fieldset.Content>
					<Fieldset.ErrorText>{authError}</Fieldset.ErrorText>

					{isSubmitted && !authError && !isPending && (
						<Fieldset.HelperText fontSize='15px' lineHeight='1.6' mb='2' mt='0'>
							{i18nData.toPost}
							{formData?.email && (
								<Highlight query={formData?.email} styles={{ fontWeight: 'semibold', mx: 1.5 }}>
									{formData?.email}
								</Highlight>
							)}
							<Text color='fg.muted'>{i18nData.signUpCodeSent}</Text>
						</Fieldset.HelperText>
					)}
				</Fieldset.Root>

				<PrimaryButton w='100%' type='submit' loading={isPending} disabled={disabled}>
					{i18nData.continue}
				</PrimaryButton>
			</Stack>
		</form>
	);
}
