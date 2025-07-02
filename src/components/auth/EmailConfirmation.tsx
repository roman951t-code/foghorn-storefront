'use client';

import React, { startTransition, useActionState, useEffect, useMemo, useState } from 'react';
import { Button, PinInput, Highlight, Fieldset, Field, Text } from '@chakra-ui/react';
import type { I18nData } from '@/types/i18n';
import { authClient } from '@/lib/auth-client';
import { emailVerificationAction } from '@/actions/emailVerificationAction';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createConfirmEmailSchema } from 'formValidationSchemas/confirmEmailSchema';

interface Props {
	disabled: boolean;
	email: string;
	i18nData: I18nData;
}

type FormValues = {
	pin: string[];
};

export default function EmailConfirmation({ i18nData, disabled, email }: Props) {
	const [timer, setTimer] = useState(0);

	const schema = useMemo(() => createConfirmEmailSchema(i18nData), [i18nData]);

	const [formError, formAction, isPending] = useActionState(emailVerificationAction, undefined);

	const {
		trigger,
		getValues,
		control,
		formState: { errors },
	} = useForm<FormValues>({
		mode: 'onSubmit',
		resolver: zodResolver(schema),
	});

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

	const formatTime = (sec: number) => {
		const m = Math.floor(sec / 60)
			.toString()
			.padStart(2, '0');
		const s = (sec % 60).toString().padStart(2, '0');
		return `${m}:${s}`;
	};

	const formData = {
		email,
		pin: getValues('pin'),
	};

	const formattedTime = formatTime(timer);

	return (
		<form
			action={async () => {
				const result = await trigger();
				if (!result) {
					return;
				}

				startTransition(() => {
					formAction(formData);
				});
			}}
		>
			<Fieldset.Root size='lg' invalid={!!errors.pin}>
				<Fieldset.Legend fontSize='17px'>{i18nData.emailConfirmation}</Fieldset.Legend>
				<Fieldset.HelperText fontSize='15px' lineHeight='1.6' mt='4'>
					{i18nData.toPost}
					<Highlight query='roman951t@gmail.com' styles={{ fontWeight: 'semibold', mx: 1.5 }}>
						{email}
					</Highlight>
					<Text color='fg.muted'>{i18nData.activationEmailCodeSent}</Text>
					{i18nData.activationCodeSentSuffix}
				</Fieldset.HelperText>

				<Fieldset.Content>
					<Controller
						control={control}
						name='pin'
						render={({ field }) => (
							<PinInput.Root
								value={field.value}
								onValueChange={(e) => field.onChange(e.value)}
								otp
								my='2'
								justifyContent='center'
							>
								<PinInput.HiddenInput />
								<PinInput.Control w='100%' justifyContent='center'>
									{Array.from({ length: 5 }).map((_, i) => (
										<PinInput.Input key={i} _focus={{ outline: 'none' }} index={i} />
									))}
								</PinInput.Control>
							</PinInput.Root>
						)}
					/>
					<Field.ErrorText>{errors.pin?.message}</Field.ErrorText>
				</Fieldset.Content>

				<Fieldset.ErrorText>{formError?.message}</Fieldset.ErrorText>

				<Button
					mt='8'
					w='100%'
					type='submit'
					loading={isPending}
					disabled={disabled}
					bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
					color='black'
					variant='solid'
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
						onClick={async () => {
							setTimer(120);
							await authClient.emailOtp.sendVerificationOtp({
								email: 'roman951t@gmail.com',
								type: 'email-verification',
							});
						}}
					>
						{i18nData.resendCode}
					</Button>
				)}
			</Fieldset.Root>
		</form>
	);
}
