import { Button, Fieldset, Input, PinInput, Stack } from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import { withMask } from 'use-mask-input';
import { useForm } from 'react-hook-form';
import type { I18nData } from '@/types/i18n';
import { useState } from 'react';

interface FormValues {
	email: string;
	password: string;
}

interface EmailAuthProps {
	onSubmitAction: (data: FormValues) => void;
	i18nData: I18nData;
	disabled: boolean;
	isSignup?: boolean;
}

export default function PhoneAuth({
	onSubmitAction,
	i18nData,
	disabled,
	isSignup = false,
}: EmailAuthProps) {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({
		mode: 'onSubmit',
	});

	const [isSubmitted, setSubmitted] = useState(false);

	const handlePhoneSubmit = (formData: FormValues) => {
		onSubmitAction(formData);
		setSubmitted(true);
	};

	return isSubmitted ? (
		<Fieldset.Root size='lg' maxW='md'>
			<Stack>
				<Fieldset.Legend fontSize='md'>{i18nData.phoneConfirmation}</Fieldset.Legend>
				<Fieldset.HelperText fontSize='15px'>
					На номер 0992304351 {i18nData.activationCodeSent}
				</Fieldset.HelperText>
			</Stack>

			<Fieldset.Content>
				<PinInput.Root otp my='2' justifyContent='center'>
					<PinInput.HiddenInput />
					<PinInput.Control w='100%' justifyContent='center'>
						{Array.from({ length: 6 }).map((_, i) => (
							<PinInput.Input
								key={i}
								_focus={{
									outline: 'none',
								}}
								index={i}
							/>
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
		</Fieldset.Root>
	) : (
		<form onSubmit={handleSubmit(handlePhoneSubmit)}>
			<Field
				label={i18nData.phoneNumber}
				invalid={!!errors.email}
				errorText={errors.email?.message}
			>
				<Input
					_focus={{
						outline: 'none',
					}}
					placeholder='(+38 0) '
					ref={withMask('(+38 0) 000000000')}
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
		</form>
	);
}
