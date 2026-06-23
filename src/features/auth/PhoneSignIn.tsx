'use client';

import { useEffect, useMemo, useState } from 'react';
import { Alert, Input, Stack, Field, Fieldset, Highlight, Text, PinInput } from '@chakra-ui/react';
import { Controller, useForm } from 'react-hook-form';
import type { I18nData } from '@/types/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPhoneSignInSchema, PhoneSignInSchema } from 'validationSchemas/phoneSignInSchema';
import { createPhoneVerifySchema, PhoneVerifySchema } from 'validationSchemas/phoneVerifySchema';
import { PrimaryButton, TertiaryButton } from '@/components/ui/buttons/ActionButton';
import { phoneSignInAction } from '@/actions/auth/phoneSignInAction';
import { useSession } from '@/providers/SessionProvider';
import {
	PHONE_INPUT_MASKS,
	buildPhoneVerificationErrorMap,
	resolveAuthErrorMessage,
} from '@/constants/auth';
import { useMaskedInput } from '@/hooks/useMaskedInput';
import { authClient } from '@/lib/auth-client';
import { formatTime } from '@/utils/generalUtils';

interface PhoneAuthProps {
	i18nData: I18nData;
	disabled?: boolean;
	isSignup?: boolean;
}

const createEmptyOtp = () => ['', '', '', '', '', ''];

export default function PhoneSignIn({ i18nData, disabled }: PhoneAuthProps) {
	const signInSchema = useMemo(() => createPhoneSignInSchema(i18nData), [i18nData]);
	const verifySchema = useMemo(() => createPhoneVerifySchema(i18nData), [i18nData]);
	const verificationErrorMap = useMemo(() => buildPhoneVerificationErrorMap(i18nData), [i18nData]);

	const { refresh } = useSession();
	const [authError, setAuthError] = useState('');
	const [verifyError, setVerifyError] = useState('');
	const [pendingPhone, setPendingPhone] = useState<string | null>(null);
	const [hasTestOtpAutofill, setHasTestOtpAutofill] = useState(false);
	const [testOtp, setTestOtp] = useState<string | null>(null);
	const [timer, setTimer] = useState(0);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<PhoneSignInSchema>({ mode: 'onSubmit', resolver: zodResolver(signInSchema) });
	const {
		control: verifyControl,
		handleSubmit: handleVerifySubmit,
		reset: resetVerifyForm,
		formState: { errors: verifyErrors, isSubmitting: isVerifying },
	} = useForm<PhoneVerifySchema>({
		mode: 'onSubmit',
		defaultValues: { otp: createEmptyOtp() },
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

	const sendOtp = async (phone: string) => {
		setAuthError('');
		setVerifyError('');

		const result = await phoneSignInAction(null, { phone });
		if (!result?.success) {
			setAuthError(result?.message || i18nData.userLoginFail);
			return false;
		}

		setPendingPhone(phone);
		setHasTestOtpAutofill(Boolean(result.devOtp));
		setTestOtp(result.devOtp ?? null);
		setTimer(120);
		resetVerifyForm({ otp: result.devOtp ? result.devOtp.split('') : createEmptyOtp() });
		return true;
	};

	const onSubmit = async (formData: PhoneSignInSchema) => {
		try {
			await sendOtp(formData.phone);
		} catch {
			setAuthError(i18nData.invalidFormData);
		}
	};

	const onVerify = async (formData: PhoneVerifySchema) => {
		if (!pendingPhone) return;

		try {
			const { error } = await authClient.phoneNumber.verify({
				phoneNumber: pendingPhone.replace(/\D/g, ''),
				code: formData.otp.join(''),
				disableSession: false,
				updatePhoneNumber: false,
			});

			if (error) {
				const message = resolveAuthErrorMessage({
					errorKey: error?.message,
					errorMap: verificationErrorMap,
					fallback: i18nData.userLoginFail,
				});
				setVerifyError(message);
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
						<Fieldset.HelperText fontSize={{ base: 'md', md: '15px' }} lineHeight='1.6' mt='1'>
							{i18nData.toPost}
							<Highlight query={pendingPhone} styles={{ fontWeight: 'semibold', mx: 1.5 }}>
								{pendingPhone}
							</Highlight>
							<Text color='fg.muted'>{i18nData.phoneCodeSent}</Text>
						</Fieldset.HelperText>

						<Fieldset.Content>
							<Alert.Root status='info' variant='subtle' mt='2'>
								<Alert.Indicator />
								<Stack gap='1'>
									<Alert.Title>{i18nData.phoneCodeInfoTitle}</Alert.Title>
									<Text fontSize={{ base: 'sm', md: 'sm' }} lineHeight='1.5'>
										{i18nData.phoneCodeInfoDescription}
									</Text>

									{testOtp ? (
										<Text fontSize={{ base: 'sm', md: 'sm' }} lineHeight='1.5' color='fg.muted'>
											Demo SMS code:{' '}
											<Highlight
												query={testOtp}
												styles={{
													fontWeight: 'semibold',
													mx: 1.5,
													color: 'var(--chakra-colors-main)',
												}}
											>
												{testOtp}
											</Highlight>
										</Text>
									) : null}

									{hasTestOtpAutofill ? (
										<Text fontSize={{ base: 'sm', md: 'sm' }} lineHeight='1.5' color='fg.muted'>
											{i18nData.phoneOtpAutofillNote}
										</Text>
									) : null}
								</Stack>
							</Alert.Root>

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
						<Text fontSize={{ base: 'md', md: '15px' }} color='main'>
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
								try {
									await sendOtp(pendingPhone);
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
							setHasTestOtpAutofill(false);
							setTestOtp(null);
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
								_focusVisible={{
									outline: '2px solid',
									outlineColor: 'main.secondary',
									outlineOffset: '2px',
								}}
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
