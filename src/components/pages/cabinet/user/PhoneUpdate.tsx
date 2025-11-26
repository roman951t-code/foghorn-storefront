'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, PinInput, Highlight, Fieldset, Text, Field } from '@chakra-ui/react';
import type { I18nData } from '@/types/i18n';
import { formatTime } from '@/utils/generalUtils';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	createPhoneVerifySchema,
	PhoneVerifySchema,
} from 'formValidationSchemas/phoneVerifySchema';
import { authClient } from '@/lib/auth-client';
import { sendVerifyPhoneAction } from '@/actions/auth/sendVerifyPhoneAction';
import { showSuccessToast } from '@/constants/toasts';

interface Props {
	i18nData: I18nData;
	phone: string;
	refreshSession: () => void;
	onCloseAction: () => void;
}

export default function PhoneUpdate({ phone, i18nData, refreshSession, onCloseAction }: Props) {
	const schema = useMemo(() => createPhoneVerifySchema(i18nData), [i18nData]);

	const [timer, setTimer] = useState(0);
	const [verifyError, setVerifyError] = useState('');
	const [isPending, setIsPending] = useState(false);

	const {
		getValues,
		control,
		formState: { errors },
	} = useForm<PhoneVerifySchema>({ mode: 'onSubmit', resolver: zodResolver(schema) });

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

		try {
			const result = await sendVerifyPhoneAction(null, { phone });

			if (!result?.success) {
				setVerifyError(result?.message!);
			}
		} catch (err) {
			setVerifyError(i18nData.invalidFormData);
		}
	};

	const onSubmit = async (formData: PhoneVerifySchema) => {
		setIsPending(true);

		const errorMap: Record<string, string> = {
			'OTP not found': i18nData.invalidOtp,
			'OTP expired': i18nData.otpExpired,
			'User not found': i18nData.userNotFound,
			'Too many attempts': i18nData.tooManyAttempts,
		};

		try {
			const { error } = await authClient.phoneNumber.verify({
				phoneNumber: phone,
				code: formData.otp.join(''),
				disableSession: true,
				updatePhoneNumber: true,
			});

			if (error) {
				const messageKey = error?.message ?? '';
				const message = errorMap[messageKey] || i18nData.userRegisterFail;
				setVerifyError(message);
				return;
			} else {
				showSuccessToast(i18nData.phoneUpdated);
				onCloseAction();

				await refreshSession();
			}
		} catch (err) {
			setVerifyError(i18nData.invalidFormData);
		} finally {
			setIsPending(false);
		}
	};

	const formattedTime = formatTime(timer);

	return (
		<Fieldset.Root size='lg' invalid>
			<Fieldset.Legend fontSize='17px'>{i18nData.phoneConfirmation}</Fieldset.Legend>
			<Fieldset.HelperText fontSize='15px' lineHeight='1.6' mt='4'>
				На номер
				<Highlight query={phone} styles={{ fontWeight: 'semibold', mx: 1.5 }}>
					{phone}
				</Highlight>
				<Text color='fg.muted'>{i18nData.updateCodeSent}</Text>
			</Fieldset.HelperText>

			<Fieldset.Content>
				<Field.Root required invalid={!!errors.otp} alignItems='center'>
					<Controller
						control={control}
						name='otp'
						render={({ field }) => (
							<PinInput.Root
								otp
								mt='2'
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
			</Fieldset.Content>
			<Fieldset.ErrorText>{verifyError}</Fieldset.ErrorText>

			<Button
				mt='6'
				w='100%'
				type='submit'
				bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
				color='black'
				variant='solid'
				loading={isPending}
				onClick={() => onSubmit(getValues())}
			>
				{i18nData.confirmPhone}
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
	);
}
