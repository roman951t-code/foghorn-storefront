'use client';

import { useActionState } from 'react';
import { Button, Input, Stack, Text, Field } from '@chakra-ui/react';
import { PasswordInput } from '@/components/ui/password-input';
import { useForm } from 'react-hook-form';
import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerEmailAction } from '@/actions/registerEmailAction';
import { createEmailSchema } from '@/schemas/emailSchema';
import type { I18nData } from '@/types/i18n';
import ResetPass from './ResetPass';

interface EmailAuthProps {
	i18nData: I18nData;
	disabled: boolean;
	isSignup?: boolean;
}

export default function EmailAuth({ i18nData, disabled, isSignup = false }: EmailAuthProps) {
	const schema = useMemo(() => createEmailSchema(i18nData), [i18nData]);

	const [formError, formAction] = useActionState(registerEmailAction, undefined);

	const {
		register,
		formState: { errors, isSubmitting },
	} = useForm({
		mode: 'onSubmit',
		resolver: zodResolver(schema),
	});

	const [isRestorePassOpen, setRestorePassOpen] = useState(false);

	if (isRestorePassOpen) {
		return <ResetPass i18nData={i18nData} onCloseAction={() => setRestorePassOpen(false)} />;
	}

	return (
		<form action={formAction}>
			<Stack gap='6' align='flex-start'>
				<Field.Root required invalid={!!errors.email}>
					<Field.Label>
						<Field.RequiredIndicator />
					</Field.Label>
					<Input fontSize='md' {...register('email')} name='email' />
					<Field.ErrorText>{errors.email?.message}</Field.ErrorText>
				</Field.Root>

				<Field.Root required invalid={!!errors.password}>
					<Field.Label>
						<Field.RequiredIndicator />
					</Field.Label>
					<PasswordInput fontSize='md' {...register('password')} name='password' />
					<Field.ErrorText>{errors.password?.message}</Field.ErrorText>
				</Field.Root>

				<Button
					id='emailSubmitButton'
					mt='2'
					w='100%'
					type='submit'
					loading={isSubmitting}
					disabled={disabled && isSignup}
				>
					{i18nData.continue}
				</Button>

				{formError?.message && (
					<Text fontSize='sm' color='red.500'>
						{formError.message}
					</Text>
				)}

				{!isSignup && (
					<Button
						w='100%'
						mt='-2'
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
