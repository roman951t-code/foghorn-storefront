'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, PinInput, Highlight, Fieldset, Text, Field, Alert } from '@chakra-ui/react';
import type { I18nData } from '@/types/i18n';
import { formatTime } from '@/utils/generalUtils';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	ConfirmResetPassSchema,
	createConfirmResetPassSchema,
} from 'formValidationSchemas/confirmResetPassSchema';
import { resetPasswordAction } from '@/actions/auth/resetPasswordAction';
import { authClient } from '@/lib/auth-client';
import { showToaster } from '@/utils/toast';
import { toasterMessages } from '@/data/toasterMessages';
import { PasswordInput } from '@/components/ui/chakra/password-input';

interface Props {
	i18nData: I18nData;
	email: string;
	backToLogin: () => void;
}

const MAX_CHARACTERS = 60;

export default function ResetPassConfirmation({ email, i18nData, backToLogin }: Props) {
	const schema = useMemo(() => createConfirmResetPassSchema(i18nData), [i18nData]);

	const [timer, setTimer] = useState(0);
	const [verifyError, setVerifyError] = useState('');
	const [isPassUpdated, setPassUpdated] = useState(false);

	const {
		handleSubmit,
		register,
		control,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<ConfirmResetPassSchema>({ mode: 'onSubmit', resolver: zodResolver(schema) });

	useEffect(() => {
		if (timer <= 0) return;

		const id = setInterval(() => {
			setTimer((t) => {
				if (t <= 1) {
					clearInterval(id);
					return 0;
				}
				return t - 1;
			});
		}, 1000);

		return () => clearInterval(id);
	}, [timer]);

	const resendVerificationCode = async () => {
		setTimer(120);
		reset();

		try {
			const result = await resetPasswordAction(null, { email });

			if (!result?.success) {
				setVerifyError(result?.message!);
			}
		} catch {
			setVerifyError(i18nData.invalidFormData);
			setPassUpdated(true);
		}
	};

	const onSubmit = async (formData: ConfirmResetPassSchema) => {
		const errorMap: Record<string, string> = {
			'OTP not found': i18nData.invalidOtp,
			'OTP expired': i18nData.otpExpired,
			'User not found': i18nData.userNotFound,
			'Too many attempts': i18nData.tooManyAttempts,
		};

		try {
			const { error: verifyError } = await authClient.emailOtp.checkVerificationOtp({
				email,
				type: 'forget-password',
				otp: formData.otp.join(''),
			});

			if (verifyError) {
				const messageKey = verifyError?.message ?? '';
				const message = errorMap[messageKey] || i18nData.setNewPassFail;
				setVerifyError(message);
				return;
			}

			const { error: resetError } = await authClient.emailOtp.resetPassword({
				email,
				otp: formData.otp.join(''),
				password: formData.password,
			});

			if (resetError) {
				const messageKey = resetError?.message ?? '';
				const message = errorMap[messageKey] || i18nData.setNewPassFail;
				setVerifyError(message);
				return;
			} else {
				showToaster('success', toasterMessages.passwordUpdated(i18nData));

				backToLogin();
			}
		} catch {
			setVerifyError(i18nData.setNewPassFail);
		}
	};

	const formattedTime = formatTime(timer);

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Fieldset.Root size='lg' invalid>
				<Fieldset.Legend fontSize='17px'>{i18nData.resetPassConfirm}</Fieldset.Legend>
				<Fieldset.HelperText fontSize='15px' lineHeight='1.6' mt='4'>
					{i18nData.toPost}
					<Highlight query={email} styles={{ fontWeight: 'semibold', mx: 1.5 }}>
						{email}
					</Highlight>
					<Text color='fg.muted'>{i18nData.resetPassCodeSent}</Text>
				</Fieldset.HelperText>

				<Fieldset.Content>
					<Field.Root required invalid={!!errors.otp} alignItems='center'>
						<Controller
							control={control}
							name='otp'
							render={({ field }) => (
								<PinInput.Root
									otp
									my='2'
									justifyContent='center'
									invalid={!!errors.otp}
									value={field.value}
									onValueChange={(e) => field.onChange(e.value)}
								>
									<PinInput.HiddenInput />
									<PinInput.Control w='100%' justifyContent='center'>
										{Array.from({ length: 6 }).map((_, i) => (
											<PinInput.Input key={i} _focus={{ outline: 'none' }} index={i} />
										))}
									</PinInput.Control>
								</PinInput.Root>
							)}
						/>

						<Field.ErrorText>{errors.otp?.message}</Field.ErrorText>
					</Field.Root>
					<Field.Root required invalid={!!errors.password || !!verifyError}>
						<Field.Label>
							{i18nData.newPass}
							<Field.RequiredIndicator />
						</Field.Label>
						<PasswordInput fontSize='md' {...register('password')} maxLength={MAX_CHARACTERS} />
						<Field.ErrorText>{errors.password?.message}</Field.ErrorText>
					</Field.Root>
				</Fieldset.Content>
				{isPassUpdated && !isSubmitting && (
					<>
						<Alert.Root status='success' variant='solid' my='2' fontSize='15px'>
							<Alert.Indicator />
							<Alert.Title>{i18nData.passUpdated}</Alert.Title>
						</Alert.Root>

						<Button
							w='100%'
							mt='4'
							type='submit'
							loading={isSubmitting}
							disabled={isSubmitting}
							borderColor='border'
							variant='outline'
							onClick={backToLogin}
						>
							{i18nData.close}
						</Button>
					</>
				)}

				<Fieldset.ErrorText>{verifyError}</Fieldset.ErrorText>

				<Button
					mt='6'
					w='100%'
					type='submit'
					bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
					color='black'
					variant='solid'
					loading={isSubmitting}
					disabled={isSubmitting}
				>
					{i18nData.saveNewPass}
				</Button>

				{timer > 0 ? (
					<Fieldset.HelperText fontSize='15px' color='main'>
						{i18nData.resendAfter}:
						<Highlight
							query={formattedTime}
							styles={{ fontWeight: 'semibold', color: 'main.accent', ml: '2' }}
						>
							{formattedTime}
						</Highlight>
					</Fieldset.HelperText>
				) : (
					<Button
						mt='4'
						variant='outline'
						border='1px solid'
						borderColor='border'
						onClick={resendVerificationCode}
					>
						{i18nData.resendCode}
					</Button>
				)}
			</Fieldset.Root>
		</form>
	);
}
