'use client';

import { Button, Fieldset, Stack, Field, Input, Highlight, Text } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState, useState } from 'react';
import type { I18nData } from '@/types/i18n';
import { useMemo } from 'react';
import { resetPasswordAction } from '@/actions/resetPasswordAction';
import { createResetPassSchema } from 'formValidationSchemas/resetPassSchema';

interface ResetPassProps {
	i18nData: I18nData;
	onCloseAction: (value: boolean) => void;
}

type FormValues = {
	email: string;
};

const MAX_CHARACTERS = 60;

export default function ResetPass({ i18nData, onCloseAction }: ResetPassProps) {
	const schema = useMemo(() => createResetPassSchema(i18nData), [i18nData]);

	const [isSubmitted, setSubmitted] = useState(false);

	const [formError, formAction, isPending] = useActionState(resetPasswordAction, undefined);

	const resetForm = () => {
		setSubmitted(false);
		onCloseAction(false);
	};

	const {
		register,
		getValues,
		handleSubmit,
		formState: { errors, isSubmitting },
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
						<Field.Root required invalid={!!errors.email}>
							<Field.Label>
								{i18nData.email}
								<Field.RequiredIndicator />
							</Field.Label>
							<Input fontSize='md' {...register('email')} maxLength={MAX_CHARACTERS} />
							<Field.ErrorText>{errors.email?.message}</Field.ErrorText>
						</Field.Root>

						<Fieldset.ErrorText>{formError?.message}</Fieldset.ErrorText>
					</Fieldset.Content>

					{isSubmitted && !formError && !isPending && (
						<Fieldset.HelperText fontSize='15px' lineHeight='1.6' mb='2' mt='0'>
							{i18nData.toPost}
							{formData?.email && (
								<Highlight query={formData?.email} styles={{ fontWeight: 'semibold', mx: 1.5 }}>
									{formData?.email}
								</Highlight>
							)}
							<Text color='fg.muted'>{i18nData.resetPassCodeSent}</Text>
						</Fieldset.HelperText>
					)}
				</Fieldset.Root>

				<Button
					w='100%'
					type='submit'
					loading={isSubmitting || isPending}
					bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
					color='black'
					variant='solid'
				>
					{i18nData.resetPassConfirm}
				</Button>

				<Button
					w='100%'
					color='main'
					variant='outline'
					border='1px solid'
					borderColor='border'
					onClick={resetForm}
				>
					{i18nData.rememberPass}
				</Button>
			</Stack>
		</form>
	);
}
