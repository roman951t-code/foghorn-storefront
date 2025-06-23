'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button, Fieldset, Input, PinInput, Highlight, Text } from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import { useHookFormMask } from 'use-mask-input';
import { useForm } from 'react-hook-form';
import { createPhoneSchema } from '@/schemas/phoneSchema';
import type { I18nData } from '@/types/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import { useActionState } from 'react';
import { registerPhoneAction } from '@/actions/registerPhoneAction';

interface FormValues {
	phone: string;
}

interface PhoneAuthProps {
	i18nData: I18nData;
	disabled: boolean;
	isSignup?: boolean;
}

export default function PhoneAuth({ i18nData, disabled, isSignup = false }: PhoneAuthProps) {
	const schema = useMemo(() => createPhoneSchema(i18nData), [i18nData]);

	const [formError, action] = useActionState(registerPhoneAction, undefined);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({ mode: 'onSubmit', resolver: zodResolver(schema) });

	const registerWithMask = useHookFormMask(register);
	const [isSubmitted, setSubmitted] = useState(false);
	const [timer, setTimer] = useState(0);

	// const handlePhoneSubmit = (formData: FormValues) => {
	// 	action(formData);
	// 	setSubmitted(true);
	// 	setTimer(120);
	// };

	useEffect(() => {
		if (!isSubmitted || timer <= 0) return;

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
	}, [isSubmitted, timer]);

	const formatTime = (sec: number) => {
		const m = Math.floor(sec / 60)
			.toString()
			.padStart(2, '0');
		const s = (sec % 60).toString().padStart(2, '0');
		return `${m}:${s}`;
	};

	const formattedTime = formatTime(timer);

	if (isSubmitted) {
		return (
			<Fieldset.Root size='lg'>
				<Fieldset.Legend fontSize='md'>{i18nData.phoneConfirmation}</Fieldset.Legend>
				<Fieldset.HelperText fontSize='15px'>
					{i18nData.activationCodeSentPrefix}
					<Highlight query='0992304351' styles={{ fontWeight: 'semibold', mx: 1.5 }}>
						0992304351
					</Highlight>
					{i18nData.activationCodeSentSuffix}
				</Fieldset.HelperText>

				<Fieldset.Content>
					<PinInput.Root otp my='2' justifyContent='center'>
						<PinInput.HiddenInput />
						<PinInput.Control w='100%' justifyContent='center'>
							{Array.from({ length: 6 }).map((_, i) => (
								<PinInput.Input key={i} _focus={{ outline: 'none' }} index={i} />
							))}
						</PinInput.Control>
					</PinInput.Root>
				</Fieldset.Content>

				<Button
					mt='8'
					w='100%'
					loading={isSubmitting}
					disabled={disabled && isSignup}
					type='submit'
					bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
					color='black'
					variant='solid'
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
						onClick={() => {
							setTimer(120);
							action({ phone: '' });
						}}
					>
						{i18nData.resendCode}
					</Button>
				)}

				{formError?.message && (
					<Text fontSize='sm' color='red.500'>
						{formError.message}
					</Text>
				)}
			</Fieldset.Root>
		);
	}

	return (
		<form action={action}>
			<Field
				label={i18nData.phoneNumber}
				invalid={!!errors.phone}
				errorText={errors.phone?.message}
			>
				<Input
					{...registerWithMask('phone', ['(+38 0) 000000000'], {
						required: i18nData.phoneRequired,
					})}
					_focus={{ outline: 'none' }}
					placeholder='(+38 0) '
					fontSize='md'
				/>
			</Field>

			<Button
				mt='8'
				w='100%'
				loading={isSubmitting}
				disabled={disabled && isSignup}
				type='submit'
				bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
				color='black'
				variant='solid'
			>
				{i18nData.continue}
			</Button>

			{formError?.message && (
				<Text fontSize='sm' color='red.500'>
					{formError.message}
				</Text>
			)}
		</form>
	);
}
