'use client';

import { Button, Fieldset, Stack, Field, Box } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { startTransition, useActionState, useEffect, useState } from 'react';
import type { I18nData } from '@/types/i18n';
import { resetPasswordAction } from '@/actions/resetPasswordAction';
import { PasswordInput } from '../ui/password-input';
import CenteredModal from '../dialogs/CenteredModal';
import { useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

interface ResetPassProps {
	i18nData: I18nData;
}

type FormValues = {
	password: string;
};

const MAX_CHARACTERS = 60;

export default function SetNewPassModal({ i18nData }: ResetPassProps) {
	const searchParams = useSearchParams();
	const { data: session } = authClient.useSession();

	const resetPass = searchParams?.get('reset-pass') === 'true';

	const [formError, formAction, isPending] = useActionState(resetPasswordAction, undefined);

	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		if (!resetPass || session) return;

		if (resetPass) {
			const token = new URLSearchParams(window.location.search).get('token');
			if (!token) {
				// Handle the error

				return;
			}

			setIsOpen(true);
		}
	}, [resetPass, session]);

	const {
		register,
		trigger,
		getValues,
		control,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({
		mode: 'onSubmit',
	});

	const formData = getValues();

	return (
		<CenteredModal
			closeOnInteractOutside={false}
			title={i18nData.renewPass}
			trigger={null}
			size='md'
			open={isOpen}
			setIsOpen={setIsOpen}
		>
			<Box maxW='400px' mx='auto' my='auto'>
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
									<PasswordInput
										fontSize='md'
										{...register('password')}
										maxLength={MAX_CHARACTERS}
									/>
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
								{i18nData.saveNewPass}
							</Button>
						</Fieldset.Root>
					</Stack>
				</form>
			</Box>
		</CenteredModal>
	);
}
