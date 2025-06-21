'use client';
import { Button, Input, Stack } from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import { useForm } from 'react-hook-form';
import { SetStateAction } from 'react';
import type { I18nData } from '@/types/i18n';

interface FormValues {
	email: string;
}

interface ResetPassProps {
	i18nData: I18nData;
	onCloseAction: (value: SetStateAction<boolean>) => void;
}

export default function ResetPass({ i18nData, onCloseAction }: ResetPassProps) {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<FormValues>({ mode: 'onSubmit' });

	const handleRestorePass = async (formData: FormValues) => {
		const response = await fetch('/api/auth/reset-password', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(formData),
		});

		if (response.ok) {
			alert('Temporary password sent to your email');
			reset();
			onCloseAction(false);
		} else {
			alert('Error: unable to send temporary password');
		}
	};

	return (
		<form onSubmit={handleSubmit(handleRestorePass)}>
			<Stack gap='4' align='flex-start'>
				<Field label={i18nData.email} invalid={!!errors.email} errorText={errors.email?.message}>
					<Input
						fontSize='md'
						_focus={{ outline: 'none' }}
						{...register('email', {
							required: i18nData.emailRequired,
							pattern: {
								value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
								message: i18nData.wrongEmail,
							},
						})}
					/>
				</Field>

				<Button
					w='100%'
					mt='4'
					type='submit'
					loading={isSubmitting}
					bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
					color='black'
					variant='solid'
				>
					{i18nData.getTemporaryPass}
				</Button>

				<Button
					w='100%'
					colorPalette='gray'
					color='main'
					variant='outline'
					border='1px solid'
					borderColor='border'
					onClick={onCloseAction}
				>
					{i18nData.rememberPass}
				</Button>
			</Stack>
		</form>
	);
}
