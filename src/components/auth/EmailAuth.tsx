import { Button, Input, Stack } from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import { PasswordInput, PasswordStrengthMeter } from '@/components/ui/password-input';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import type { I18nData } from '@/types/i18n';
import ResetPass from './ResetPass';

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

export default function EmailAuth({
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

	const [isRestorePassOpen, setRestorePassOpen] = useState(false);

	const handleSignup = async (formData: FormValues) => {
		onSubmitAction(formData);

		// const { email, password } = formData;
		// const response = await fetch('/api/auth/signup', {
		// 	method: 'POST',
		// 	headers: {
		// 		'Content-Type': 'application/json',
		// 	},
		// 	body: JSON.stringify({ email, password }),
		// });

		// if (response.ok) {
		// 	console.log('Email confirmation sent successfully.');
		// } else {
		// 	console.error('Failed to send email confirmation.');
		// }
	};

	if (isRestorePassOpen) {
		return <ResetPass i18nData={i18nData} onCloseAction={() => setRestorePassOpen(false)} />;
	}

	return (
		<form onSubmit={handleSubmit(handleSignup)}>
			<Stack gap='6' align='flex-start'>
				<Field label={i18nData.email} invalid={!!errors.email} errorText={errors.email?.message}>
					<Input
						_focus={{
							outline: 'none',
						}}
						fontSize='md'
						{...register('email', {
							required: i18nData.emailRequired,
							pattern: {
								value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
								message: i18nData.wrongEmail,
							},
						})}
					/>
				</Field>

				{!isRestorePassOpen && (
					<>
						<Field
							label={i18nData.password}
							invalid={!!errors.password}
							errorText={errors.password?.message}
						>
							<PasswordInput
								_focus={{
									outline: 'none',
								}}
								fontSize='md'
								{...register('password', {
									required: i18nData.passRequired,
									// minLength: {
									// 	value: 8,
									// 	message: i18nData.wrongPassLength,
									// },
									// pattern: {
									// 	value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d]{8,}$/,
									// 	message: i18nData.wrongPassFormat,
									// },
								})}
							/>
							{isSignup && <PasswordStrengthMeter i18nData={i18nData} mt='1' w='100%' value={3} />}
						</Field>

						<Button
							id='emailSubmitButton'
							mt='2'
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
					</>
				)}

				{!isRestorePassOpen && !isSignup && (
					<Button
						w='100%'
						mt='-2'
						colorPalette='gray'
						color='main'
						variant='outline'
						border='1px solid'
						borderColor='border'
						onClick={() => setRestorePassOpen(true)}
					>
						{i18nData.restorePass}
					</Button>
				)}
			</Stack>
		</form>
	);
}
