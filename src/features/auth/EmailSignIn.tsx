'use client';

import { useEffect } from 'react';
import { Input, Stack, Field, Fieldset, Alert } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { createEmailSignInSchema, EmailSchema } from 'validationSchemas/emailSignInSchema';
import type { I18nData } from '@/types/i18n';
import ResetPass from './ResetPass';
import { loginEmailAction } from '@/actions/auth/loginEmailAction';
import { authClient } from '@/lib/auth-client';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useSession } from '@/providers/SessionProvider';
import { PrimaryButton, TertiaryButton } from '@/components/ui/buttons/ActionButton';
import { PasswordInput } from '@/components/ui/chakra/password-input';
import { buildEmailSignInErrorMap, resolveAuthErrorMessage } from '@/constants/auth';

interface EmailAuthProps {
	i18nData: I18nData;
	disabled?: boolean;
}

const MAX_CHARACTERS = 60;

export default function EmailSignIn({ i18nData, disabled }: EmailAuthProps) {
	const router = useRouter();

	const [authError, setAuthError] = useState('');

	const [forceOpen, setForceOpen] = useState(false);
	const [isRestorePassOpen, setRestorePassOpen] = useState(false);

	const searchParams = useSearchParams();
	const emailSignIn = searchParams?.get('email-sign-in') === 'true';
	const { refresh } = useSession();

	const schema = useMemo(() => createEmailSignInSchema(i18nData), [i18nData]);

	const refreshSession = async () => {
		await refresh();

		const bc = new BroadcastChannel('auth');
		bc.postMessage('session-updated');
		bc.close();
	};

	useEffect(() => {
		if (!emailSignIn) return;

		const handleEmailSignIn = async () => {
			setForceOpen(true);

			const current = new URLSearchParams(window.location.search);
			current.delete('email-sign-in');
			const newSearch = current.toString();
			const newPath = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`;
			router.replace(newPath);
		};

		handleEmailSignIn();
	}, [emailSignIn, router]);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<EmailSchema>({
		mode: 'onSubmit',
		resolver: zodResolver(schema),
	});
	const errorMap = useMemo(() => buildEmailSignInErrorMap(i18nData), [i18nData]);

	if (isRestorePassOpen) {
		return <ResetPass i18nData={i18nData} backToLogin={() => setRestorePassOpen(false)} />;
	}

	const onSubmit = async (formData: EmailSchema) => {
		try {
			const result = await loginEmailAction(null, formData);

			if (result?.success) {
				const { error } = await authClient.signIn.email({
					email: formData.email,
					password: formData.password,
				});

				if (error) {
					const message = resolveAuthErrorMessage({
						errorKey: error?.message,
						errorMap,
						fallback: i18nData.userLoginFail,
					});
					setAuthError(message);
					return;
				}

				refreshSession();
			} else {
				setAuthError(result?.message!);
			}
		} catch (err) {
			setAuthError(i18nData.invalidFormData);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Stack gap='4' align='flex-start'>
				<Fieldset.Root size='lg' invalid>
					<Fieldset.Content>
						<Field.Root required invalid={!!errors?.email || !!authError}>
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
					<Fieldset.ErrorText>{authError}</Fieldset.ErrorText>

					{forceOpen && (
						<Alert.Root status='success' variant='solid' my='2' fontSize={{ base: 'md', md: '15px' }}>
							<Alert.Indicator />
							<Alert.Title>{i18nData.emailConfirmed}</Alert.Title>
						</Alert.Root>
					)}
				</Fieldset.Root>

				<PrimaryButton
					w='100%'
					type='submit'
					loading={isSubmitting}
					disabled={disabled || isSubmitting}
				>
					{i18nData.continue}
				</PrimaryButton>

				<TertiaryButton w='100%' onClick={() => setRestorePassOpen(true)}>
					{i18nData.resetPassAction}
				</TertiaryButton>
			</Stack>
		</form>
	);
}
