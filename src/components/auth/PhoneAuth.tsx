import { Button, Input, PinInput } from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import { withMask } from 'use-mask-input';
import { useForm } from 'react-hook-form';
import type { I18nData } from '@/types/i18n';

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

	return (
		<form onSubmit={handleSubmit(onSubmitAction)}>
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
			<PinInput.Root otp mt='4' justifyContent='center'>
				<PinInput.HiddenInput />
				<PinInput.Control w='100%' justifyContent='center'>
					<PinInput.Input
						_focus={{
							outline: 'none',
						}}
						index={0}
					/>
					<PinInput.Input
						_focus={{
							outline: 'none',
						}}
						index={1}
					/>
					<PinInput.Input
						_focus={{
							outline: 'none',
						}}
						index={2}
					/>
					<PinInput.Input
						_focus={{
							outline: 'none',
						}}
						index={3}
					/>
					<PinInput.Input
						_focus={{
							outline: 'none',
						}}
						index={4}
					/>
					<PinInput.Input
						_focus={{
							outline: 'none',
						}}
						index={5}
					/>
				</PinInput.Control>
			</PinInput.Root>
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
