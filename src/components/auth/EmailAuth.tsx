'use client';

import { startTransition, useActionState } from 'react';
import { Button, Input, Stack, Field, Fieldset } from '@chakra-ui/react';
import { PasswordInput } from '@/components/ui/password-input';
import { useForm } from 'react-hook-form';
import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerEmailAction } from '@/actions/registerEmailAction';
import { createEmailSignUpSchema } from '@/schemas/emailSignUpSchema';
import { createEmailSignInSchema } from '@/schemas/emailSignInSchema';
import type { I18nData } from '@/types/i18n';
import ResetPass from './ResetPass';

interface EmailAuthProps {
	i18nData: I18nData;
	disabled: boolean;
	isSignup?: boolean;
}

type FormValues = {
	email: string;
	password: string;
	confirmPassword?: string;
};

export default function EmailAuth({ i18nData, disabled, isSignup = false }: EmailAuthProps) {
	const schema = useMemo(
		() => (isSignup ? createEmailSignUpSchema(i18nData) : createEmailSignInSchema(i18nData)),
		[i18nData]
	);

	const [formError, formAction, isPending] = useActionState(registerEmailAction, undefined);
	const {
		register,
		trigger,
		getValues,
		formState: { errors },
	} = useForm<FormValues>({
		mode: 'onSubmit',
		resolver: zodResolver(schema),
	});

	const [isRestorePassOpen, setRestorePassOpen] = useState(false);

	if (isRestorePassOpen) {
		return <ResetPass i18nData={i18nData} onCloseAction={() => setRestorePassOpen(false)} />;
	}

	return (
		<form
			action={async () => {
				const result = await trigger();
				if (!result) return;

				const formData = getValues();

				startTransition(() => {
					formAction(formData);
				});
			}}
		>
			<Stack gap='6' align='flex-start'>
				<Fieldset.Root size='lg' invalid>
					<Fieldset.Content>
						<Field.Root required invalid={!!errors.email}>
							<Field.Label>
								{i18nData.email}
								<Field.RequiredIndicator />
							</Field.Label>
							<Input fontSize='md' {...register('email')} />
							<Field.ErrorText>{errors.email?.message}</Field.ErrorText>
						</Field.Root>

						<Field.Root required invalid={!!errors.password}>
							<Field.Label>
								{i18nData.password}
								<Field.RequiredIndicator />
							</Field.Label>
							<PasswordInput fontSize='md' {...register('password')} />
							<Field.ErrorText>{errors.password?.message}</Field.ErrorText>
						</Field.Root>

						{isSignup && (
							<Field.Root required={isSignup} invalid={!!errors.confirmPassword}>
								<Field.Label>
									{i18nData.confirmPassword}
									<Field.RequiredIndicator />
								</Field.Label>
								<PasswordInput fontSize='md' {...register('confirmPassword')} />
								<Field.ErrorText>
									<Field.ErrorText>{errors.confirmPassword?.message}</Field.ErrorText>
								</Field.ErrorText>
							</Field.Root>
						)}
					</Fieldset.Content>
					<Fieldset.ErrorText>{formError?.message}</Fieldset.ErrorText>
				</Fieldset.Root>

				<Button
					w='100%'
					type='submit'
					loading={isPending}
					disabled={disabled && isSignup}
					color='black'
					bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
				>
					{i18nData.continue}
				</Button>

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
