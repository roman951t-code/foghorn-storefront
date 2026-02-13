'use client';

import { useEffect, useMemo, useState } from 'react';
import { Input, Stack, Field, Fieldset, Highlight, Text, PinInput } from '@chakra-ui/react';
import { Controller, useForm } from 'react-hook-form';
import type { I18nData } from '@/types/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPhoneSignUpSchema, PhoneSignUpSchema } from 'validationSchemas/phoneSignUpSchema';
import { createPhoneVerifySchema, PhoneVerifySchema } from 'validationSchemas/phoneVerifySchema';
import { PrimaryButton, TertiaryButton } from '@/components/ui/buttons/ActionButton';
import { phoneSignUpAction } from '@/actions/auth/phoneSignUpAction';
import { registerPhoneAction } from '@/actions/auth/registerPhoneAction';
import { useSession } from '@/providers/SessionProvider';
import { PHONE_INPUT_MASKS, MAX_NAME_LENGTH, buildPhoneVerificationErrorMap } from '@/constants/auth';
import { useMaskedInput } from '@/hooks/useMaskedInput';
import { authClient } from '@/lib/auth-client';
import { formatTime } from '@/utils/generalUtils';

interface PhoneAuthProps {
	i18nData: I18nData;
	disabled?: boolean;
}

export default function PhoneSignUp({ i18nData, disabled }: PhoneAuthProps) {
	const signUpSchema = useMemo(() => createPhoneSignUpSchema(i18nData), [i18nData]);
	const verifySchema = useMemo(() => createPhoneVerifySchema(i18nData), [i18nData]);

	const { refresh } = useSession();
	const [authError, setAuthError] = useState('');
	const [verifyError, setVerifyError] = useState('');
	const [pendingPhone, setPendingPhone] = useState<string | null>(null);
	const [pendingName, setPendingName] = useState<string | null>(null);
	const [timer, setTimer] = useState(0);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<PhoneSignUpSchema>({ mode: 'onSubmit', resolver: zodResolver(signUpSchema) });
	const {
		control: verifyControl,
		handleSubmit: handleVerifySubmit,
		reset: resetVerifyForm,
		formState: { errors: verifyErrors, isSubmitting: isVerifying },
	} = useForm<PhoneVerifySchema>({
		mode: 'onSubmit',
		defaultValues: { otp: ['', '', '', '', '', ''] },
		resolver: zodResolver(verifySchema),
	});
	const registerWithMask = useMaskedInput(register);

	useEffect(() => {
		if (timer <= 0) return;

		const id = setInterval(() => {
			setTimer((value) => {
				if (value <= 1) {
					clearInterval(id);
					return 0;
				}
				return value - 1;
			});
		}, 1000);

		return () => clearInterval(id);
	}, [timer]);

	const refreshSession = async () => {
		await refresh();

		const bc = new BroadcastChannel('auth');
		bc.postMessage('session-updated');
		bc.close();
	};

	const sendOtp = async ({ phone, name }: { phone: string; name: string }) => {
		setAuthError('');
		setVerifyError('');

		const result = await phoneSignUpAction(null, { phone, name });
		if (!result?.success) {
			setAuthError(result?.message || i18nData.userRegisterFail);
			return false;
		}

		setPendingPhone(phone);
		setPendingName(name);
		setTimer(120);
		resetVerifyForm({ otp: ['', '', '', '', '', ''] });
		return true;
	};

	const onSubmit = async (formData: PhoneSignUpSchema) => {
		try {
			await sendOtp({ phone: formData.phone, name: formData.name });
		} catch {
			setAuthError(i18nData.invalidFormData);
		}
	};

	const onVerify = async (formData: PhoneVerifySchema) => {
		if (!pendingPhone || !pendingName) return;

		const errorMap = buildPhoneVerificationErrorMap(i18nData);

		try {
			const verifyResponse = await authClient.phoneNumber.verify({
				phoneNumber: pendingPhone.replace(/\D/g, ''),
				code: formData.otp.join(''),
				disableSession: false,
				updatePhoneNumber: false,
			});

			if (verifyResponse.error) {
				const messageKey = verifyResponse.error?.message ?? '';
				const message =
					(messageKey && messageKey in errorMap
						? errorMap[messageKey as keyof typeof errorMap]
						: null) || i18nData.userRegisterFail;
				setVerifyError(message);
				return;
			}

			const registerResult = await registerPhoneAction(null, {
				phone: pendingPhone,
				name: pendingName,
			});
			if (!registerResult?.success) {
				setVerifyError(registerResult?.message || i18nData.userRegisterFail);
				return;
			}

			await refreshSession();
		} catch {
			setVerifyError(i18nData.invalidFormData);
		}
	};

	if (pendingPhone) {
		return (
			<form onSubmit={handleVerifySubmit(onVerify)}>
				<Stack gap='4' align='flex-start'>
					<Fieldset.Root size='lg' invalid>
						<Fieldset.Legend fontSize='17px'>{i18nData.phoneConfirmation}</Fieldset.Legend>
						<Fieldset.HelperText fontSize='15px' lineHeight='1.6' mt='1'>
							{i18nData.toPost}
							<Highlight query={pendingPhone} styles={{ fontWeight: 'semibold', mx: 1.5 }}>
								{pendingPhone}
							</Highlight>
							<Text color='fg.muted'>{i18nData.signUpCodeSent}</Text>
						</Fieldset.HelperText>

						<Fieldset.Content>
							<Field.Root required invalid={!!verifyErrors.otp} alignItems='center'>
								<Controller
									control={verifyControl}
									name='otp'
									render={({ field }) => (
										<PinInput.Root
											otp
											mt='2'
											justifyContent='center'
											invalid={!!verifyErrors.otp}
											value={field.value}
											onValueChange={(event) => field.onChange(event.value)}
										>
											<PinInput.HiddenInput />
											<PinInput.Control w='100%' justifyContent='center'>
												{Array.from({ length: 6 }).map((_, index) => (
													<PinInput.Input key={index} index={index} />
												))}
											</PinInput.Control>
										</PinInput.Root>
									)}
								/>
								<Field.ErrorText>{verifyErrors.otp?.message}</Field.ErrorText>
							</Field.Root>
						</Fieldset.Content>
						<Fieldset.ErrorText>{verifyError}</Fieldset.ErrorText>
					</Fieldset.Root>

					<PrimaryButton
						w='100%'
						type='submit'
						loading={isVerifying}
						disabled={disabled || isVerifying}
					>
						{i18nData.confirmPhone}
					</PrimaryButton>

					{timer > 0 ? (
						<Text fontSize='15px' color='main'>
							{i18nData.resendAfter}:
							<Highlight
								query={formatTime(timer)}
								styles={{ fontWeight: 'semibold', color: 'main.accent', ml: '2' }}
							>
								{formatTime(timer)}
							</Highlight>
						</Text>
					) : (
						<TertiaryButton
							w='100%'
							type='button'
							onClick={async () => {
								if (!pendingName) return;
								try {
									await sendOtp({ phone: pendingPhone, name: pendingName });
								} catch {
									setVerifyError(i18nData.invalidFormData);
								}
							}}
							disabled={isVerifying}
						>
							{i18nData.resendCode}
						</TertiaryButton>
					)}

					<TertiaryButton
						w='100%'
						type='button'
						onClick={() => {
							setPendingPhone(null);
							setPendingName(null);
							setTimer(0);
							setVerifyError('');
						}}
						disabled={isVerifying}
					>
						{i18nData.backToLogin}
					</TertiaryButton>
				</Stack>
			</form>
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
								_focusVisible={{ outline: '2px solid', outlineColor: 'main.secondary', outlineOffset: '2px' }}
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
					{i18nData.sendOtp}
				</PrimaryButton>
			</Stack>
		</form>
	);
}
