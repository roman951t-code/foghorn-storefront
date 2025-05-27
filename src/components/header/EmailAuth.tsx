'use client';

import { Button, Input, Stack } from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import { PasswordInput } from '@/components/ui/password-input';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import type { I18nData } from '@/types/i18n';

interface FormValues {
	email: string;
	password: string;
}

interface EmailAuthProps {
	onSubmitAction: (data: FormValues) => void;
	i18nData: I18nData;
}

export default function EmailAuth({ onSubmitAction, i18nData }: EmailAuthProps) {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({
		mode: 'onSubmit',
	});

	const [isRestorePassOpen, setRestorePassOpen] = useState(false);

	return (
		<form onSubmit={handleSubmit(onSubmitAction)}>
			<Stack gap='6' align='flex-start' maxW='sm'>
				<Field label={i18nData.email} invalid={!!errors.email} errorText={errors.email?.message}>
					<Input
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
								{...register('password', {
									required: i18nData.passRequired,
									minLength: {
										value: 8,
										message: i18nData.wrongPassLength,
									},
									pattern: {
										value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d]{8,}$/,
										message: i18nData.wrongPassFormat,
									},
								})}
							/>
						</Field>

						<Button
							w='100%'
							disabled={isSubmitting}
							type='submit'
							bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
							color='black'
							variant='solid'
						>
							{i18nData.continue}
						</Button>
					</>
				)}

				{!isRestorePassOpen && (
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

				{isRestorePassOpen && (
					<Button
						w='100%'
						disabled={isSubmitting}
						type='submit'
						mt='-2'
						bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
						color='black'
						variant='solid'
						onClick={() => setRestorePassOpen(false)}
					>
						{i18nData.getTemporaryPass}
					</Button>
				)}
			</Stack>
		</form>
	);
}
