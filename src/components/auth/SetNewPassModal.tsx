'use client';

import { Button, Fieldset, Stack, Field } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { startTransition, useActionState } from 'react';
import type { I18nData } from '@/types/i18n';
import { useMemo } from 'react';
import { resetPasswordAction } from '@/actions/resetPasswordAction';
import { PasswordInput } from '../ui/password-input';
import { createRestorePassSchema } from 'formValidationSchemas/resetPassSchema';

interface ResetPassProps {
	i18nData: I18nData;
	onCloseAction: (value: boolean) => void;
}

type FormValues = {
	pin: string[];
	password: string;
};

const MAX_CHARACTERS = 60;

export default function SetNewPassModal({ i18nData, onCloseAction }: ResetPassProps) {
	const schema = useMemo(() => createRestorePassSchema(i18nData), [i18nData]);

	const [formError, formAction, isPending] = useActionState(resetPasswordAction, undefined);

	const {
		register,
		trigger,
		getValues,
		control,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({
		mode: 'onSubmit',
		resolver: zodResolver(schema),
	});

	const formData = getValues();

	return (
		<form
			action={async () => {
				const result = await trigger();
				if (!result) {
					return;
				}

				startTransition(() => {
					formAction(formData);
				});
			}}
		>
			<Stack gap='4' align='flex-start'>
				<Fieldset.Root size='lg' invalid>
					<Fieldset.Content>
						<Field.Root required invalid={!!errors.password}>
							<Field.Label>
								{i18nData.password}
								<Field.RequiredIndicator />
							</Field.Label>
							<PasswordInput fontSize='md' {...register('password')} maxLength={MAX_CHARACTERS} />
							<Field.ErrorText>{errors.password?.message}</Field.ErrorText>
						</Field.Root>

						<Fieldset.ErrorText>{formError?.message}</Fieldset.ErrorText>
					</Fieldset.Content>

					<Button
						w='100%'
						mt='4'
						type='submit'
						loading={isSubmitting || isPending}
						bg={{ base: 'bg.accent', _hover: 'bgHover.accent' }}
						color='black'
						variant='solid'
					>
						{i18nData.setnewpass}
					</Button>

					<Button
						w='100%'
						color='main'
						variant='outline'
						border='1px solid'
						borderColor='border'
						onClick={() => onCloseAction(false)}
					>
						{i18nData.rememberPass}
					</Button>
				</Fieldset.Root>
			</Stack>
		</form>
	);
}
