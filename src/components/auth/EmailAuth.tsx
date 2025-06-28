'use client';

import { startTransition, useActionState } from 'react';
import { Button, Input, Stack, Field, Fieldset } from '@chakra-ui/react';
import { PasswordInput } from '@/components/ui/password-input';
import { useForm } from 'react-hook-form';
import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerEmailAction } from '@/actions/registerEmailAction';
import { createEmailSignUpSchema } from 'formValidationSchemas/emailSignUpSchema';
import { createEmailSignInSchema } from 'formValidationSchemas/emailSignInSchema';
import type { I18nData } from '@/types/i18n';
import ResetPass from './ResetPass';

interface EmailAuthProps {
	i18nData: I18nData;
	disabled: boolean;
	isSignup?: boolean;
}

type FormValues = {
	firstName?: string;
	lastName?: string;
	email: string;
	password: string;
	confirmPassword?: string;
};

const MAX_CHARACTERS = 60;

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
			<Stack gap='4' align='flex-start'>
				<Fieldset.Root size='lg' invalid>
					<Fieldset.Content>
						{isSignup && (
							<>
								<Field.Root required={isSignup} invalid={!!errors.firstName}>
									<Field.Label>
										{i18nData.name}
										<Field.RequiredIndicator />
									</Field.Label>
									<Input fontSize='md' {...register('firstName')} maxLength={MAX_CHARACTERS} />
									<Field.ErrorText>{errors.firstName?.message}</Field.ErrorText>
								</Field.Root>

								<Field.Root invalid={!!errors.lastName}>
									<Field.Label>{i18nData.lastname}</Field.Label>
									<Input fontSize='md' {...register('lastName')} maxLength={MAX_CHARACTERS} />
									<Field.ErrorText>{errors.lastName?.message}</Field.ErrorText>
								</Field.Root>
							</>
						)}

						<Field.Root required invalid={!!errors.email}>
							<Field.Label>
								{i18nData.email}
								<Field.RequiredIndicator />
							</Field.Label>
							<Input fontSize='md' {...register('email')} maxLength={MAX_CHARACTERS} />
							<Field.ErrorText>{errors.email?.message}</Field.ErrorText>
						</Field.Root>

						<Field.Root required invalid={!!errors.password}>
							<Field.Label>
								{i18nData.password}
								<Field.RequiredIndicator />
							</Field.Label>
							<PasswordInput fontSize='md' {...register('password')} maxLength={MAX_CHARACTERS} />
							<Field.ErrorText>{errors.password?.message}</Field.ErrorText>
						</Field.Root>

						{isSignup && (
							<Field.Root required={isSignup} invalid={!!errors.confirmPassword}>
								<Field.Label>
									{i18nData.confirmPassword}
									<Field.RequiredIndicator />
								</Field.Label>
								<PasswordInput
									fontSize='md'
									{...register('confirmPassword')}
									maxLength={MAX_CHARACTERS}
								/>
								<Field.ErrorText>{errors.confirmPassword?.message}</Field.ErrorText>
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
