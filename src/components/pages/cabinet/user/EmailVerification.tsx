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
import { toaster } from '@/components/reusable/chakra/toaster';
import { sendVerifyEmailAction } from '@/actions/auth/sendVerifyEmailAction';
import { verifyEmailOtpAction } from '@/actions/auth/verifyEmailOtpAction';
import { useSession } from '@/components/providers/SessionProvider';

interface Props {
	i18nData: I18nData;
	onClose: () => void;
	email: string;
}

export default function EmailVerification({ email, i18nData, onClose }: Props) {
	const schema = useMemo(() => createPhoneVerifySchema(i18nData), [i18nData]);

	const { refresh } = useSession();

	const [timer, setTimer] = useState(0);
	const [verifyError, setVerifyError] = useState('');
	const [isPending, setIsPending] = useState(false);

	const {
		handleSubmit,
		control,
		reset,
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
		reset();

		setTimer(120);
		setIsPending(true);

		try {
			const result = await sendVerifyEmailAction(null, { email });

			if (!result?.success) {
				setVerifyError(i18nData.editEmailFail);
			} else {
				setVerifyError('');
			}
		} catch {
			setVerifyError(i18nData.editEmailFail);
		} finally {
			setIsPending(false);
		}
	};

	const onSubmit = async (formData: PhoneVerifySchema) => {
		setIsPending(true);
		try {
			const result = await verifyEmailOtpAction(email, formData.otp.join(''));

			if (!result?.success) {
				setVerifyError(result?.message!);
			} else {
				toaster.success({
					title: i18nData.emailUpdated,
					duration: 5000,
				});

				await refresh();
				onClose();
			}
		} catch {
			setVerifyError(i18nData.invalidFormData);
		} finally {
			setIsPending(false);
		}
	};

	const formattedTime = formatTime(timer);

	return (
		<form
			onSubmit={(e) => {
				e.stopPropagation();
				void handleSubmit(onSubmit)(e);
			}}
		>
			<Fieldset.Root size='lg' invalid>
				<Fieldset.Legend fontSize='17px'>{i18nData.emailConfirmation}</Fieldset.Legend>
				<Fieldset.HelperText fontSize='15px' lineHeight='1.6' mt='4'>
					{i18nData.toPost}
					<Highlight query={email} styles={{ fontWeight: 'semibold', mx: 1.5 }}>
						{email}
					</Highlight>
					<Text color='fg.muted'>{i18nData.signUpCodeSent}</Text>
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
				>
					{i18nData.confirmEmail}
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
