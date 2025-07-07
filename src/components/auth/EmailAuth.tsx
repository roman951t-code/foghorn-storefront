'use client';

import { startTransition, useActionState, useEffect } from 'react';
import { Button, Input, Stack, Field, Fieldset, Text, Highlight, Alert } from '@chakra-ui/react';
import { PasswordInput } from '@/components/ui/password-input';
import { useForm } from 'react-hook-form';
import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerEmailAction } from '@/actions/registerEmailAction';
import { createEmailSignUpSchema } from 'formValidationSchemas/emailSignUpSchema';
import { createEmailSignInSchema } from 'formValidationSchemas/emailSignInSchema';
import type { I18nData } from '@/types/i18n';
import ResetPass from './ResetPass';
import { loginEmailAction } from '@/actions/loginEmailAction';
import { authClient } from '@/lib/auth-client';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

type FormValues = {
	firstName?: string;
	lastName?: string;
	email: string;
	password: string;
	confirmPassword?: string;
};

interface EmailAuthProps {
	i18nData: I18nData;
	disabled?: boolean;
	isSignup?: boolean;
}

const MAX_CHARACTERS = 60;

export default function EmailAuth({ i18nData, disabled, isSignup = false }: EmailAuthProps) {
	const router = useRouter();

	const [signUpError, signUpFormAction, isSignUpPending] = useActionState(
		registerEmailAction,
		undefined
	);
	const [signInError, signInFormAction, isSignInPending] = useActionState(
		loginEmailAction,
		undefined
	);

	const [authError, setAuthError] = useState('');

	const searchParams = useSearchParams();
	const emailSignIn = searchParams?.get('email-sign-in') === 'true';

	const [forceOpen, setForceOpen] = useState(false);

	const { data: session } = authClient.useSession();

	const schema = useMemo(
		() => (isSignup ? createEmailSignUpSchema(i18nData) : createEmailSignInSchema(i18nData)),
		[i18nData]
	);

	const [isRestorePassOpen, setRestorePassOpen] = useState(false);
	const [isSubmitted, setSubmitted] = useState(false);

	useEffect(() => {
		if (!emailSignIn || session) return;

		if (emailSignIn) {
			setForceOpen(true);

			const current = new URLSearchParams(window.location.search);
			current.delete('email-sign-in');
			const newSearch = current.toString();
			const newPath = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`;
			router.replace(newPath);
		}
	}, [emailSignIn, session]);

	const {
		register,
		getValues,
		handleSubmit,
		formState: { errors },
	} = useForm<FormValues>({
		mode: 'onSubmit',
		resolver: zodResolver(schema),
	});

	const formData = getValues();

	if (isRestorePassOpen) {
		return <ResetPass i18nData={i18nData} onCloseAction={() => setRestorePassOpen(false)} />;
	}

	const formAction = isSignup ? signUpFormAction : signInFormAction;
	const formError = isSignup ? signUpError : signInError;
	const isPending = isSignup ? isSignUpPending : isSignInPending;

	const errorMap: Record<string, string> = {
		'Invalid email or password': i18nData.invalidFormData,
		'User not found': i18nData.userNotFound,
		'Email not verified': i18nData.emailNotVerified,
		'Too many attempts': i18nData.tooManyAttempts,
	};

	return (
		<form
			onSubmit={handleSubmit(async (formData) => {
				startTransition(async () => {
					formAction(formData);

					if (isSignup) {
						setSubmitted(true);
					} else {
						const { error } = await authClient.signIn.email({
							email: formData.email,
							password: formData.password,
						});

						if (error) {
							const messageKey = error?.message ?? '';
							const message = errorMap[messageKey] || i18nData.userLoginFail;

							setAuthError(message);
						}
					}
				});
			})}
		>
			<Stack gap='4' align='flex-start'>
				<Fieldset.Root size='lg' invalid>
					<Fieldset.Content>
						{isSignup && (
							<>
								<Field.Root required={isSignup} invalid={!!errors.firstName}>
									<Field.Label>
										{i18nData.name}
										<Field.RequiredIndicator />
									</Field.Label>
									<Input fontSize='md' {...register('firstName')} maxLength={MAX_CHARACTERS} />
									<Field.ErrorText>{errors.firstName?.message}</Field.ErrorText>
								</Field.Root>

								<Field.Root invalid={!!errors.lastName}>
									<Field.Label>{i18nData.lastname}</Field.Label>
									<Input fontSize='md' {...register('lastName')} maxLength={MAX_CHARACTERS} />
									<Field.ErrorText>{errors.lastName?.message}</Field.ErrorText>
								</Field.Root>
							</>
						)}

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

						{isSignup && (
							<Field.Root required={isSignup} invalid={!!errors.confirmPassword}>
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
						)}
					</Fieldset.Content>
					<Fieldset.ErrorText>{authError || formError?.message}</Fieldset.ErrorText>

					{forceOpen && (
						<Alert.Root status='success' variant='solid' my='2' fontSize='15px'>
							<Alert.Indicator />
							<Alert.Title>{i18nData.emailConfirmed}</Alert.Title>
						</Alert.Root>
					)}

					{isSubmitted && isSignup && !formError && !isPending && (
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

				{!isSignup && (
					<Button
						w='100%'
						variant='outline'
						border='1px solid'
						borderColor='border'
						onClick={() => setRestorePassOpen(true)}
					>
						{i18nData.resetPassAction}
					</Button>
				)}
			</Stack>
		</form>
	);
}
