'use client';

import { startTransition, useActionState } from 'react';
import { Button, Input, Stack, Field, Fieldset, Text, Highlight } from '@chakra-ui/react';
import { PasswordInput } from '@/components/ui/password-input';
import { useForm } from 'react-hook-form';
import { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerEmailAction } from '@/actions/registerEmailAction';
import { createEmailSignUpSchema } from 'formValidationSchemas/emailSignUpSchema';
import type { I18nData } from '@/types/i18n';

type FormValues = {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	confirmPassword: string;
};

interface EmailAuthProps {
	i18nData: I18nData;
	disabled?: boolean;
}

const MAX_CHARACTERS = 60;

export default function EmailSignUp({ i18nData, disabled }: EmailAuthProps) {
	const [formError, formAction, isPending] = useActionState(registerEmailAction, undefined);

	const [isSubmitted, setSubmitted] = useState(false);

	const schema = useMemo(() => createEmailSignUpSchema(i18nData), [i18nData]);

	const {
		register,
		getValues,
		handleSubmit,
		formState: { errors },
	} = useForm<FormValues>({
		mode: 'onSubmit',
		resolver: zodResolver(schema),
	});

	const formData = getValues();

	return (
		<form
			onSubmit={handleSubmit(async (formData) => {
				startTransition(async () => {
					formAction(formData);
					setSubmitted(true);
				});
			})}
		>
			<Stack gap='4' align='flex-start'>
				<Fieldset.Root size='lg' invalid>
					<Fieldset.Content>
						<Field.Root required invalid={!!errors.firstName}>
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

						<Field.Root required invalid={!!errors.confirmPassword}>
							<Field.Label>
								{i18nData.confirmPassword}
								<Field.RequiredIndicator />
							</Field.Label>
							<PasswordInput
								{...register('confirmPassword')}
								fontSize='md'
								maxLength={MAX_CHARACTERS}
							/>
							<Field.ErrorText>{errors.confirmPassword?.message}</Field.ErrorText>
						</Field.Root>
					</Fieldset.Content>
					<Fieldset.ErrorText>{formError?.message}</Fieldset.ErrorText>

					{isSubmitted && !formError && !isPending && (
						<Fieldset.HelperText fontSize='15px' lineHeight='1.6' mb='2' mt='0'>
							{i18nData.toPost}
							{formData?.email && (
								<Highlight query={formData?.email} styles={{ fontWeight: 'semibold', mx: 1.5 }}>
									{formData?.email}
								</Highlight>
							)}
							<Text color='fg.muted'>{i18nData.signUpCodeSent}</Text>
						</Fieldset.HelperText>
					)}
				</Fieldset.Root>

				<Button
					w='100%'
					type='submit'
					loading={isPending}
					disabled={disabled}
					color='black'
					bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
				>
					{i18nData.continue}
				</Button>
			</Stack>
		</form>
	);
}
