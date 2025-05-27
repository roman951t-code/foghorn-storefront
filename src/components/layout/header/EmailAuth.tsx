'use client';

import { Button, Input, Stack } from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import { PasswordInput } from '@/components/ui/password-input';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface FormValues {
	email: string;
	password: string;
}

interface Props {
	onSubmit: (data) => void;
}

export default function EmailAuth({ onSubmit }: Props) {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({
		mode: 'onSubmit',
	});

	const [isRestorePassOpen, setRestorePassOpen] = useState(false);

	const t = useTranslations('Auth');

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Stack gap='6' align='flex-start' maxW='sm'>
				{!isRestorePassOpen && (
					<>
						<Field label={t('email')} invalid={!!errors.email} errorText={errors.email?.message}>
							<Input
								{...register('email', {
									required: t('emailRequired'),
									pattern: {
										value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
										message: t('wrongEmail'),
									},
								})}
							/>
						</Field>

						<Field
							label={t('password')}
							invalid={!!errors.password}
							errorText={errors.password?.message}
						>
							<PasswordInput
								{...register('password', {
									required: t('passRequired'),
									minLength: { value: 8, message: t('wrongPassLength') },
									pattern: {
										value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d]{8,}$/,
										message: t('wrongPassFormat'),
									},
								})}
							/>
						</Field>
						<Button
							w='100%'
							loading={isSubmitting}
							type='submit'
							bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
							color='black'
							variant='solid'
						>
							{t('continue')}
						</Button>
					</>
				)}

				{isRestorePassOpen && (
					<>
						<Field label={t('email')} invalid={!!errors.email} errorText={errors.email?.message}>
							<Input
								{...register('email', {
									required: t('emailRequired'),
									pattern: {
										value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
										message: t('wrongEmail'),
									},
								})}
							/>
						</Field>
					</>
				)}

				{!isRestorePassOpen && (
					<Button
						w='100%'
						mt='-2'
						colorPalette='gray'
						color='main'
						variant='outline'
						border='1px solid '
						borderColor='border'
						onClick={() => setRestorePassOpen(true)}
					>
						{t('restorePass')}
					</Button>
				)}
				{isRestorePassOpen && (
					<Button
						w='100%'
						loading={isSubmitting}
						type='submit'
						mt='-2'
						bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
						color='black'
						variant='solid'
						onClick={() => setRestorePassOpen(false)}
					>
						{t('getTemporaryPass')}
					</Button>
				)}
			</Stack>
		</form>
	);
}
