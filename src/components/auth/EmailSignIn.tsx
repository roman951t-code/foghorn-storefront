'use client';

import { startTransition, useActionState, useEffect } from 'react';
import { Button, Input, Stack, Field, Fieldset, Alert } from '@chakra-ui/react';
import { PasswordInput } from '@/components/ui/password-input';
import { useForm } from 'react-hook-form';
import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { createEmailSignInSchema } from 'formValidationSchemas/emailSignInSchema';
import type { I18nData } from '@/types/i18n';
import ResetPass from './ResetPass';
import { loginEmailAction } from '@/actions/loginEmailAction';
import { authClient } from '@/lib/auth-client';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

type FormValues = {
	email: string;
	password: string;
};

interface EmailAuthProps {
	i18nData: I18nData;
	disabled?: boolean;
}

const MAX_CHARACTERS = 60;

export default function EmailSignIn({ i18nData, disabled }: EmailAuthProps) {
	const router = useRouter();

	const [formError, formAction, isPending] = useActionState(loginEmailAction, undefined);

	const [authError, setAuthError] = useState('');
	const [forceOpen, setForceOpen] = useState(false);
	const [isRestorePassOpen, setRestorePassOpen] = useState(false);

	const searchParams = useSearchParams();
	const emailSignIn = searchParams?.get('email-sign-in') === 'true';

	const { data: session } = authClient.useSession();

	const schema = useMemo(() => createEmailSignInSchema(i18nData), [i18nData]);

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
		handleSubmit,
		formState: { errors },
	} = useForm<FormValues>({
		mode: 'onSubmit',
		resolver: zodResolver(schema),
	});

	if (isRestorePassOpen) {
		return <ResetPass i18nData={i18nData} onCloseAction={() => setRestorePassOpen(false)} />;
	}

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

					const { error } = await authClient.signIn.email({
						email: formData.email,
						password: formData.password,
					});

					if (error) {
						const messageKey = error?.message ?? '';
						const message = errorMap[messageKey] || i18nData.userLoginFail;

						setAuthError(message);
					}
				});
			})}
		>
			<Stack gap='4' align='flex-start'>
				<Fieldset.Root size='lg' invalid>
					<Fieldset.Content>
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
					</Fieldset.Content>
					<Fieldset.ErrorText>{authError || formError?.message}</Fieldset.ErrorText>

					{forceOpen && (
						<Alert.Root status='success' variant='solid' my='2' fontSize='15px'>
							<Alert.Indicator />
							<Alert.Title>{i18nData.emailConfirmed}</Alert.Title>
						</Alert.Root>
					)}
				</Fieldset.Root>

				<Button
					w='100%'
					type='submit'
					loading={isPending}
					disabled={disabled}
					color='black'
					bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
				>
					{i18nData.continue}
				</Button>

				<Button
					w='100%'
					variant='outline'
					border='1px solid'
					borderColor='border'
					onClick={() => setRestorePassOpen(true)}
				>
					{i18nData.resetPassAction}
				</Button>
			</Stack>
		</form>
	);
}
