'use client';

import { Button, Fieldset, Stack, Field, Input } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import type { I18nData } from '@/types/i18n';
import { useMemo } from 'react';
import { resetPasswordAction } from '@/actions/auth/resetPasswordAction';
import { createResetPassSchema, ResetPassSchema } from 'formValidationSchemas/resetPassSchema';
import ResetPassConfirmation from './ResetPassConfirmation';

interface ResetPassProps {
	i18nData: I18nData;
	backToLogin: () => void;
}

const MAX_CHARACTERS = 60;

export default function ResetPass({ i18nData, backToLogin }: ResetPassProps) {
	const schema = useMemo(() => createResetPassSchema(i18nData), [i18nData]);

	const [isOtpSent, setOtpSent] = useState(false);
	const [actionError, setActionError] = useState('');
	const [isPending, setIsPending] = useState(false);

	const {
		register,
		getValues,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ResetPassSchema>({
		mode: 'onSubmit',
		resolver: zodResolver(schema),
	});

	const onSubmit = async (formData: ResetPassSchema) => {
		setOtpSent(true);

		setIsPending(true);

		try {
			const result = await resetPasswordAction(null, formData);
			if (!result?.success) {
				setActionError(result?.message!);
			}
		} catch {
			setActionError(i18nData.invalidFormData);
		} finally {
			setIsPending(false);
			setOtpSent(true);
		}
	};

	const formData = getValues();

	const isOtpFormVisible = isOtpSent && !actionError && !isPending;

	if (isOtpFormVisible) {
		return (
			<ResetPassConfirmation i18nData={i18nData} email={formData.email} backToLogin={backToLogin} />
		);
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Stack gap='4' align='flex-start'>
				<Fieldset.Root size='lg' invalid>
					<Fieldset.Content>
						<Field.Root required invalid={!!errors.email || !!actionError}>
							<Field.Label>
								{i18nData.email}
								<Field.RequiredIndicator />
							</Field.Label>
							<Input fontSize='md' {...register('email')} maxLength={MAX_CHARACTERS} />
							<Field.ErrorText>{errors.email?.message}</Field.ErrorText>
						</Field.Root>

						<Fieldset.ErrorText>{actionError}</Fieldset.ErrorText>
					</Fieldset.Content>
				</Fieldset.Root>

				<Button
					w='100%'
					type='submit'
					loading={isSubmitting || isPending}
					bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
					color='black'
					variant='solid'
				>
					{i18nData.sendOtp}
				</Button>

				<Button
					w='100%'
					color='main'
					variant='outline'
					border='1px solid'
					borderColor='border'
					onClick={backToLogin}
				>
					{i18nData.rememberPass}
				</Button>
			</Stack>
		</form>
	);
}
