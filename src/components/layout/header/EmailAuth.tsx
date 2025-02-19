'use client';

import { Button, Input, Stack } from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import { PasswordInput } from '@/components/ui/password-input';
import { useForm } from 'react-hook-form';

interface FormValues {
	email: string;
	password: string;
}

interface Props {
	submitText: string;
	emailLabel: string;
	passLabel: string;
	emailRequired: string;
	passRequired: string;
}

export default function EmailAuth({
	submitText,
	emailLabel,
	passLabel,
	emailRequired,
	passRequired,
}: Props) {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({
		mode: 'onSubmit',
	});

	const onSubmit = handleSubmit(async (data) => {
		try {
			console.log('Form Submitted:', data);
		} catch (error) {
			console.error('Submission failed:', error);
		}
	});

	return (
		<form onSubmit={onSubmit}>
			<Stack gap='6' align='flex-start' maxW='sm'>
				<Field label={emailLabel} invalid={!!errors.email} errorText={errors.email?.message}>
					<Input
						{...register('email', {
							required: emailRequired,
							pattern: {
								value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
								message: 'Invalid email address',
							},
						})}
					/>
				</Field>

				<Field label={passLabel} invalid={!!errors.password} errorText={errors.password?.message}>
					<PasswordInput
						{...register('password', {
							required: passRequired,
							minLength: { value: 6, message: 'Password must be at least 6 characters' },
						})}
					/>
				</Field>

				<Button
					w='100%'
					type='submit'
					bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
					color='black'
					variant='solid'
				>
					{submitText}
				</Button>
			</Stack>
		</form>
	);
}
